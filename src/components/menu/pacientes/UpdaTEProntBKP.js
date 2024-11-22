import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { Search as SearchIcon, CameraAlt as CameraAltIcon, UploadFile as UploadFileIcon, PictureAsPdf as PictureAsPdfIcon } from "@mui/icons-material";
import { collection, getDocs, getFirestore, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import jsPDF from "jspdf";


const UploadProntuarios = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        const fetchPacientes = async () => {
            const firestore = getFirestore();
            const pacientesCollection = collection(firestore, "pacientes_cadastrados");
            try {
                const snapshot = await getDocs(pacientesCollection);
                const pacientesList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPacientes(pacientesList);
            } catch (error) {
                console.error("Erro ao buscar pacientes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPacientes();
    }, []);

    const handleAbrirModal = (paciente) => {
        setPacienteSelecionado(paciente);
        setUploadedPhotos(paciente.prontuarioFotos || []);
        setModalAberto(true);
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setPacienteSelecionado(null);
        setFiles([]);
    };

    const handleFileChange = (event) => {
        setFiles([...files, ...Array.from(event.target.files)]);
    };

    const handleTakePhoto = async () => {
        try {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.capture = "environment";
            fileInput.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    setFiles((prevFiles) => [...prevFiles, file]);
                }
            };
            fileInput.click();
        } catch (error) {
            console.error("Erro ao tirar foto:", error);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            alert("Por favor, selecione ou tire fotos antes de fazer o upload.");
            return;
        }

        setUploading(true);
        const storage = getStorage();
        const uploadedUrls = [];

        try {
            for (const file of files) {
                const storageRef = ref(storage, `prontuarios/${pacienteSelecionado.id}/${file.name || `prontuario_${Date.now()}.jpg`}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        null,
                        (error) => {
                            console.error("Erro no upload:", error);
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            uploadedUrls.push(downloadURL);
                            resolve();
                        }
                    );
                });
            }

            const firestore = getFirestore();
            const pacienteRef = doc(firestore, "pacientes_cadastrados", pacienteSelecionado.id);
            await updateDoc(pacienteRef, {
                prontuarioFotos: [...(pacienteSelecionado.prontuarioFotos || []), ...uploadedUrls],
            });

            setUploadedPhotos((prev) => [...prev, ...uploadedUrls]);
            setFiles([]);
            setOpenSnackbar(true);
            handleFecharModal();
        } catch (error) {
            console.error("Erro ao fazer upload:", error);
            alert("Erro ao fazer upload. Tente novamente.");
        } finally {
            setUploading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleDownloadPDF = async () => {
        if (!uploadedPhotos || uploadedPhotos.length === 0) {
            alert("Nenhuma foto para gerar o PDF.");
            return;
        }
    
        const pdf = new jsPDF();
    
        for (let i = 0; i < uploadedPhotos.length; i++) {
            const imageUrl = uploadedPhotos[i];
    
            // Criação de uma promessa para carregar a imagem
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous"; // Garante que a imagem seja carregada sem erros de CORS
                img.src = imageUrl;
    
                img.onload = () => {
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = img.width;
                    const imgHeight = img.height;
    
                    const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
                    const scaledWidth = imgWidth * scale;
                    const scaledHeight = imgHeight * scale;
    
                    pdf.addImage(
                        img,
                        "JPEG",
                        (pageWidth - scaledWidth) / 2,
                        (pageHeight - scaledHeight) / 2,
                        scaledWidth,
                        scaledHeight
                    );
    
                    if (i < uploadedPhotos.length - 1) pdf.addPage(); // Adiciona uma nova página, exceto na última imagem
                    resolve();
                };
    
                img.onerror = (error) => {
                    console.error("Erro ao carregar a imagem:", error);
                    reject(error);
                };
            });
        }
    
        pdf.save(`prontuario_${pacienteSelecionado.nome}.pdf`);
    };
    

    const filteredPacientes = pacientes.filter((paciente) =>
        paciente.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box padding="2rem">
            <Typography variant="h4" gutterBottom>
                Upload de Prontuários
            </Typography>
            <Box display="flex" alignItems="center" marginBottom="1rem">
                <TextField
                    label="Pesquisar Paciente"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <IconButton>
                                <SearchIcon />
                            </IconButton>
                        ),
                    }}
                />
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>E-mail</TableCell>
                            <TableCell>CPF</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPacientes.map((paciente) => (
                            <TableRow key={paciente.id}>
                                <TableCell>{paciente.nome}</TableCell>
                                <TableCell>{paciente.email}</TableCell>
                                <TableCell>{paciente.cpf}</TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleAbrirModal(paciente)}>
                                        <UploadFileIcon />
                                    </IconButton>
                                    {paciente.prontuarioFotos?.length > 0 && (
                                        <IconButton color="secondary" onClick={handleDownloadPDF}>
                                            <PictureAsPdfIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={modalAberto} onClose={handleFecharModal} fullWidth maxWidth="sm">
                <DialogTitle>Upload de Prontuário</DialogTitle>
                <DialogContent>
                    {pacienteSelecionado && (
                        <>
                            <Typography>
                                Fotos enviadas para o paciente: <strong>{pacienteSelecionado.nome}</strong>
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap="1rem" marginTop="1rem">
                                {uploadedPhotos.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Prontuário ${index + 1}`}
                                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                ))}
                            </Box>
                            <Box display="flex" flexDirection="column" alignItems="center" marginTop="1rem">
                                <Button variant="contained" color="primary" startIcon={<CameraAltIcon />} onClick={handleTakePhoto}>
                                    Tirar Foto
                                </Button>
                                <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ marginTop: "1rem" }} />
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleFecharModal} disabled={uploading}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Enviando..." : "Fazer Upload"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
                    Upload realizado com sucesso!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UploadProntuarios;
