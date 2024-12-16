/* eslint-disable */
import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Typography,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    Search as SearchIcon,
    CameraAlt as CameraAltIcon,
    UploadFile as UploadFileIcon,
    PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import { collection, getDocs, getFirestore, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import MenuPrincipal from "../MenuPrincipal";
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
    const [paginaAtual, setPaginaAtual] = useState(1);
    const pacientesPorPagina = 10;

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
        setUploadedPhotos([]);
    };

    const handleFileChange = (event) => {
        setFiles([...files, ...Array.from(event.target.files)]);
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

    const handleDownloadPDF = async () => {
        if (!pacienteSelecionado || !uploadedPhotos.length) {
            alert("Nenhum paciente ou fotos disponíveis para gerar o PDF.");
            return;
        }

        const pdf = new jsPDF();

        for (let i = 0; i < uploadedPhotos.length; i++) {
            const imageUrl = uploadedPhotos[i];
            try {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = imageUrl;
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        const scale = Math.min(pageWidth / img.width, pageHeight / img.height);
                        const width = img.width * scale;
                        const height = img.height * scale;
                        pdf.addImage(img, "JPEG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
                        if (i < uploadedPhotos.length - 1) pdf.addPage();
                        resolve();
                    };
                    img.onerror = reject;
                });
            } catch (error) {
                alert("Erro ao carregar imagem para o PDF: " + imageUrl);
                return;
            }
        }

        pdf.save(`prontuario_${pacienteSelecionado.nome || "paciente"}.pdf`);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const indiceInicial = (paginaAtual - 1) * pacientesPorPagina;
    const pacientesPaginados = pacientes
        .filter((paciente) => paciente.nome.toLowerCase().includes(termoPesquisa.toLowerCase()))
        .slice(indiceInicial, indiceInicial + pacientesPorPagina);

    const totalPaginas = Math.ceil(
        pacientes.filter((paciente) => paciente.nome.toLowerCase().includes(termoPesquisa.toLowerCase())).length /
            pacientesPorPagina
    );

    const handleProximaPagina = () => {
        if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
    };

    const handlePaginaAnterior = () => {
        if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box padding="1rem">
            <MenuPrincipal />
            <Typography variant="h5" gutterBottom>
                Upload de Prontuários
            </Typography>
            <Box display="flex" marginBottom="1rem">
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
            <Box>
                {pacientesPaginados.length === 0 ? (
                    <Typography align="center">Nenhum paciente encontrado.</Typography>
                ) : (
                    pacientesPaginados.map((paciente) => (
                        <Card key={paciente.id} variant="outlined" style={{ marginBottom: "1rem" }}>
                            <CardContent>
                                <Typography><strong>Nome:</strong> {paciente.nome}</Typography>
                                <Typography><strong>Email:</strong> {paciente.email}</Typography>
                                <Typography><strong>CPF:</strong> {paciente.cpf}</Typography>
                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleAbrirModal(paciente)}
                                        startIcon={<UploadFileIcon />}
                                    >
                                        Upload
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => {
                                            setPacienteSelecionado(paciente);
                                            setUploadedPhotos(paciente.prontuarioFotos || []);
                                            handleDownloadPDF();
                                        }}
                                        disabled={!paciente.prontuarioFotos?.length}
                                        startIcon={<PictureAsPdfIcon />}
                                    >
                                        Gerar PDF
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginY="1rem">
                <Button variant="contained" onClick={handlePaginaAnterior} disabled={paginaAtual === 1}>
                    Anterior
                </Button>
                <Typography>Página {paginaAtual} de {totalPaginas}</Typography>
                <Button variant="contained" onClick={handleProximaPagina} disabled={paginaAtual === totalPaginas}>
                    Próxima
                </Button>
            </Box>
            <Dialog open={modalAberto} onClose={handleFecharModal} fullWidth maxWidth="xs">
                <DialogTitle>Upload de Prontuário</DialogTitle>
                <DialogContent>
                    {pacienteSelecionado && (
                        <>
                            <Typography>Fotos para: <strong>{pacienteSelecionado.nome}</strong></Typography>
                            <Box display="flex" flexWrap="wrap" gap="0.5rem" marginTop="1rem">
                                {uploadedPhotos.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Prontuário ${index + 1}`}
                                        style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                ))}
                            </Box>
                            <Box marginTop="1rem">
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CameraAltIcon />}
                                    onClick={() => document.getElementById("fileInput").click()}
                                >
                                    Selecionar Fotos
                                </Button>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleFecharModal} disabled={uploading}>Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? "Enviando..." : "Upload"}
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
