import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ThemeProvider,
    Typography,
    FormControlLabel,
    Checkbox,
    Pagination,
    Snackbar,
    Alert
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import { collection, getDocs, getFirestore, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import temaUNNA from "../../../temas";
import MenuPrincipal from "../MenuPrincipal";
import CadastroPaciente from "./CadastroPaciente";
import useStyles from "./VisualizarPacienteStyles";

const AcoesPaciente = ({ paciente, onEdit, onDelete, onView }) => {
    return (
        <>
            <IconButton color="primary" onClick={() => onEdit(paciente)}>
                <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => onDelete(paciente)}>
                <DeleteIcon />
            </IconButton>
            <IconButton onClick={() => onView(paciente)}>
                <VisibilityIcon />
            </IconButton>
        </>
    );
};

const PacientesCadastrados = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [telefones, setTelefones] = useState(['']);
    const [contadorPacientes, setContadorPacientes] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [error, setError] = useState(null);
    const itemsPerPage = 50;
    const styles = useStyles();

    useEffect(() => {
        const firestore = getFirestore();
        const pacientesCollection = collection(firestore, "pacientes_cadastrados");

        const listarPacientes = async () => {
            try {
                const snapshot = await getDocs(pacientesCollection);
                const pacientesList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                const pacientesSemDuplicatas = await removerDuplicatas(pacientesList);
                setPacientes(pacientesSemDuplicatas);
                setContadorPacientes(pacientesSemDuplicatas.length);
            } catch (error) {
                console.error(error);
                setError("Erro ao carregar pacientes. Por favor, tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        listarPacientes();
    }, []);

    const removerDuplicatas = async (pacientesList) => {
        const cpfSet = new Set();
        const duplicatas = [];

        for (const paciente of pacientesList) {
            if (paciente.cpf && cpfSet.has(paciente.cpf)) {
                duplicatas.push(paciente);
            } else if (paciente.cpf) {
                cpfSet.add(paciente.cpf);
            }
        }

        for (const duplicado of duplicatas) {
            await deleteDoc(doc(getFirestore(), "pacientes_cadastrados", duplicado.id));
        }

        return pacientesList.filter(paciente => !duplicatas.includes(paciente));
    };

    const handleAbrirModalCadastro = () => {
        setModalCadastroAberto(true);
    };

    const handleFecharModalCadastro = () => {
        setModalCadastroAberto(false);
    };

    const handleAbrirModalDetalhes = () => {
        setModalDetalhesAberto(true);
    };

    const handleFecharModalDetalhes = () => {
        setModalDetalhesAberto(false);
    };

    const handleAbrirModalEditar = (paciente) => {
        setPacienteSelecionado(paciente);
        setTelefones(paciente.telefone.split(',').map(tel => tel.trim()));
        setModalEditarAberto(true);
    };

    const handleFecharModalEditar = () => {
        setModalEditarAberto(false);
    };

    const handleSearchChange = (event) => {
        setTermoPesquisa(event.target.value);
        setCurrentPage(1);
    };

    const handleEdit = (paciente) => {
        handleAbrirModalEditar(paciente);
    };

    const handleView = (paciente) => {
        setPacienteSelecionado(paciente);
        handleAbrirModalDetalhes();
    };

    const handleDelete = async (paciente) => {
        const confirmar = window.confirm("Tem certeza que deseja excluir permanentemente este paciente?");
        if (confirmar) {
            try {
                await deleteDoc(doc(getFirestore(), "pacientes_cadastrados", paciente.id));
                setPacientes(pacientes.filter((item) => item.id !== paciente.id));
                setContadorPacientes(contadorPacientes - 1);
                alert("Paciente excluído com sucesso!");
            } catch (error) {
                console.error("Erro ao excluir paciente:", error);
                alert("Erro ao excluir paciente.");
            }
        }
    };

    const handleAtualizarPaciente = async (dadosPaciente) => {
        if (!validateForm(dadosPaciente)) return;
        try {
            const pacienteRef = doc(getFirestore(), "pacientes_cadastrados", dadosPaciente.id);
            await updateDoc(pacienteRef, dadosPaciente);
            setPacientes(pacientes.map((paciente) =>
                paciente.id === dadosPaciente.id ? dadosPaciente : paciente
            ));
            handleFecharModalEditar();
            alert("Paciente atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar paciente:", error);
            alert("Erro ao atualizar paciente.");
        }
    };

    const handleAdicionarPaciente = async (dadosPaciente) => {
        if (isSubmitting) return;
        if (!validateForm(dadosPaciente)) return;

        setIsSubmitting(true);
        try {
            const firestore = getFirestore();
            const docRef = await addDoc(collection(firestore, "pacientes_cadastrados"), dadosPaciente);
            const novoPaciente = { id: docRef.id, ...dadosPaciente };
            setPacientes((prevPacientes) => [...prevPacientes, novoPaciente]);
            setContadorPacientes(contadorPacientes + 1);
            handleFecharModalCadastro();
            setOpenSnackbar(true);
        } catch (error) {
            console.error("Erro ao adicionar paciente:", error);
            alert("Erro ao adicionar paciente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateForm = (dadosPaciente) => {
        const newErrors = {};

        if (!dadosPaciente.nome) {
            newErrors.nome = "Nome é obrigatório";
        }
        if (!dadosPaciente.email) {
            newErrors.email = "E-mail é obrigatório";
        } else if (!/\S+@\S+\.\S+/.test(dadosPaciente.email)) {
            newErrors.email = "Formato de e-mail inválido";
        }
        if (!dadosPaciente.cpf) {
            newErrors.cpf = "CPF é obrigatório";
        }
        if (!telefones.some(tel => tel)) {
            newErrors.telefone = "Telefone é obrigatório";
        } else {
            telefones.forEach(telefone => {
                if (telefone && !/^\(\d{2}\)\d{4,5}-\d{4}$/.test(telefone)) {
                    newErrors.telefone = "Formato de telefone inválido";
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatTelefone = (telefone) => {
        const cleaned = telefone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1)$2-$3');
        } else if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
        }
        return telefone;
    };

    const handleTelefoneChange = (index, value) => {
        const formatted = formatTelefone(value);
        const newTelefones = [...telefones];
        newTelefones[index] = formatted;
        setTelefones(newTelefones);
        setPacienteSelecionado((prev) => ({
            ...prev,
            telefone: newTelefones.join(', '),
        }));
    };

    const handleAddTelefone = () => {
        setTelefones([...telefones, '']);
    };

    const formatarCPF = (cpf) => {
        if (!cpf) return '';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const tableHead = ["Nome", "E-mail", "CPF", "Gênero", "Telefone", "Ações"];

    const filteredPacientes = pacientes.filter((paciente) => {
        const searchLower = termoPesquisa.toLowerCase();
        return (
            (paciente.nome && paciente.nome.toLowerCase().includes(searchLower)) ||
            (paciente.email && paciente.email.toLowerCase().includes(searchLower)) ||
            (paciente.cpf && paciente.cpf.includes(searchLower))
        );
    });

    const pageCount = Math.ceil(filteredPacientes.length / itemsPerPage);
    const currentItems = filteredPacientes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <ThemeProvider theme={temaUNNA}>
            <div className={styles.usuariosContainer}>
                <MenuPrincipal />
                <div className={styles.usuariosContent}>
                    <Box display="flex" justifyContent="space-between" alignItems="left" marginBottom="2rem">
                        <Typography variant="h4" gutterBottom component="div">
                            Pacientes Cadastrados ({contadorPacientes})
                        </Typography>
                        <Box display="flex" alignItems="center">
                            <TextField
                                label="Pesquisar Paciente"
                                variant="outlined"
                                size="small"
                                value={termoPesquisa}
                                onChange={handleSearchChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => console.log("Pesquisar")}>
                                                <SearchIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                style={{ marginRight: "1rem" }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAbrirModalCadastro}
                                disabled={isSubmitting}
                            >
                                Novo Paciente
                            </Button>
                        </Box>
                    </Box>
                    <TableContainer component={Paper} elevation={4}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {tableHead.map((headItem, index) => (
                                        <TableCell key={index}>{headItem}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.map((paciente, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{paciente.nome}</TableCell>
                                        <TableCell>{paciente.email}</TableCell>
                                        <TableCell>{formatarCPF(paciente.cpf) || 'N/A'}</TableCell>
                                        <TableCell>{paciente.genero}</TableCell>
                                        <TableCell>{paciente.telefone}</TableCell>
                                        <TableCell>
                                            <AcoesPaciente
                                                paciente={paciente}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onView={handleView}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box display="flex" justifyContent="center" marginTop="2rem">
                        <Pagination
                            count={pageCount}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>

                    {/* Modal para adicionar novo paciente */}
                    <Dialog open={modalCadastroAberto} onClose={handleFecharModalCadastro} fullWidth maxWidth="md">
                        <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
                        <DialogContent>
                            <CadastroPaciente onSalvar={handleAdicionarPaciente} errors={errors} />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleFecharModalCadastro}>Cancelar</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Modal para visualizar paciente */}
                    <Dialog open={modalDetalhesAberto} onClose={handleFecharModalDetalhes} fullWidth maxWidth="md">
                        <DialogTitle>Detalhes do Paciente</DialogTitle>
                        <DialogContent>
                            {pacienteSelecionado && (
                                <>
                                    <Typography>Nome: {pacienteSelecionado.nome}</Typography>
                                    <Typography>E-mail: {pacienteSelecionado.email}</Typography>
                                    <Typography>CPF: {formatarCPF(pacienteSelecionado.cpf) || 'N/A'}</Typography>
                                    <Typography>RG: {pacienteSelecionado.rg || 'N/A'}</Typography>
                                    <Typography>Sexo Biológico: {pacienteSelecionado.sexoBiologico || 'N/A'}</Typography>
                                    <Typography>Gênero: {pacienteSelecionado.genero}</Typography>
                                    <Typography>Data de Nascimento: {pacienteSelecionado.dataNascimento}</Typography>
                                    <Typography>CEP: {pacienteSelecionado.cep}</Typography>
                                    <Typography>Endereço: {pacienteSelecionado.endereco}</Typography>
                                    <Typography>Bairro: {pacienteSelecionado.bairro}</Typography>
                                    <Typography>Cidade: {pacienteSelecionado.cidade}</Typography>
                                    <Typography>Estado: {pacienteSelecionado.estado}</Typography>
                                    <Typography>Número da residência: {pacienteSelecionado.numeroResidencia}</Typography>
                                    <Typography>Telefone: {pacienteSelecionado.telefone}</Typography>
                                    {pacienteSelecionado.prontuarioAntigo && (
                                        <>
                                            <Typography>Número do Prontuário Antigo: {pacienteSelecionado.prontuarioAntigo}</Typography>
                                            <Typography>Localização do Prontuário Antigo: {pacienteSelecionado.localizacaoProntuarioAntigo}</Typography>
                                        </>
                                    )}
                                    <Typography>
                                        {pacienteSelecionado.falecido ? "Paciente Falecido" : ""}
                                    </Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleFecharModalDetalhes}>Fechar</Button>
                        </DialogActions>
                    </Dialog>

                    {/* Modal para editar paciente */}
                    <Dialog open={modalEditarAberto} onClose={handleFecharModalEditar} fullWidth maxWidth="md">
                        <DialogTitle>Editar Paciente</DialogTitle>
                        <DialogContent>
                            {pacienteSelecionado && (
                                <form>
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Nome"
                                        type="text"
                                        value={pacienteSelecionado.nome}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                nome: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                        error={!!errors.nome}
                                        helperText={errors.nome}
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="E-mail"
                                        type="email"
                                        value={pacienteSelecionado.email}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="CPF"
                                        type="text"
                                        value={pacienteSelecionado.cpf || ''}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                cpf: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                        error={!!errors.cpf}
                                        helperText={errors.cpf}
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="RG"
                                        type="text"
                                        value={pacienteSelecionado.rg || ''}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                rg: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Sexo Biológico"
                                        type="text"
                                        value={pacienteSelecionado.sexoBiologico || ''}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Gênero"
                                        type="text"
                                        value={pacienteSelecionado.genero}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                genero: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Data de Nascimento"
                                        type="date"
                                        value={pacienteSelecionado.dataNascimento}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                dataNascimento: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="CEP"
                                        type="text"
                                        value={pacienteSelecionado.cep}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                cep: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Endereço"
                                        type="text"
                                        value={pacienteSelecionado.endereco}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                endereco: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Bairro"
                                        type="text"
                                        value={pacienteSelecionado.bairro}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                bairro: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Cidade"
                                        type="text"
                                        value={pacienteSelecionado.cidade}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                cidade: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Estado"
                                        type="text"
                                        value={pacienteSelecionado.estado}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                estado: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Número da residência"
                                        type="text"
                                        value={pacienteSelecionado.numeroResidencia}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                numeroResidencia: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    {telefones.map((telefone, index) => (
                                        <TextField
                                            key={index}
                                            fullWidth
                                            margin="dense"
                                            label={`Telefone ${index + 1}`}
                                            type="text"
                                            value={telefone}
                                            onChange={(e) => handleTelefoneChange(index, e.target.value)}
                                            variant="outlined"
                                            error={!!errors.telefone}
                                            helperText={errors.telefone}
                                        />
                                    ))}
                                    <Box display="flex" alignItems="center" marginTop={2}>
                                        <IconButton color="primary" onClick={handleAddTelefone}>
                                            <AddCircleIcon />
                                        </IconButton>
                                        <Typography>Possui mais de um telefone?</Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={pacienteSelecionado.temProntuarioAntigo}
                                                onChange={(e) =>
                                                    setPacienteSelecionado((prev) => ({
                                                        ...prev,
                                                        temProntuarioAntigo: e.target.checked,
                                                    }))
                                                }
                                            />
                                        }
                                        label="Possui prontuário antigo?"
                                    />
                                    {pacienteSelecionado.temProntuarioAntigo && (
                                        <>
                                            <TextField
                                                fullWidth
                                                margin="dense"
                                                label="Número do Prontuário Antigo"
                                                type="text"
                                                value={pacienteSelecionado.prontuarioAntigo}
                                                onChange={(e) =>
                                                    setPacienteSelecionado((prev) => ({
                                                        ...prev,
                                                        prontuarioAntigo: e.target.value,
                                                    }))
                                                }
                                                variant="outlined"
                                            />
                                            <TextField
                                                fullWidth
                                                margin="dense"
                                                label="Localização do Prontuário Antigo"
                                                type="text"
                                                value={pacienteSelecionado.localizacaoProntuarioAntigo}
                                                onChange={(e) =>
                                                    setPacienteSelecionado((prev) => ({
                                                        ...prev,
                                                        localizacaoProntuarioAntigo: e.target.value,
                                                    }))
                                                }
                                                variant="outlined"
                                            />
                                        </>
                                    )}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={pacienteSelecionado.falecido || false}
                                                onChange={(e) =>
                                                    setPacienteSelecionado((prev) => ({
                                                        ...prev,
                                                        falecido: e.target.checked,
                                                    }))
                                                }
                                            />
                                        }
                                        label="Paciente Falecido"
                                    />
                                </form>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleFecharModalEditar}>Cancelar</Button>
                            <Button
                                onClick={() => handleAtualizarPaciente(pacienteSelecionado)}
                                variant="contained"
                                color="primary"
                            >
                                Salvar
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
                    >
                        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                            Paciente cadastrado com sucesso!
                        </Alert>
                    </Snackbar>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default PacientesCadastrados;
