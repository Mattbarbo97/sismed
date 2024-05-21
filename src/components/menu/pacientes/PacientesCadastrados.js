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
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
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
            } catch (error) {
                console.error(error);
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
            if (cpfSet.has(paciente.cpf)) {
                duplicatas.push(paciente);
            } else {
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

    const handleAbrirModalEditar = () => {
        setModalEditarAberto(true);
    };

    const handleFecharModalEditar = () => {
        setModalEditarAberto(false);
    };

    const handleSearchChange = (event) => {
        setTermoPesquisa(event.target.value);
    };

    const handleEdit = (paciente) => {
        setPacienteSelecionado(paciente);
        handleAbrirModalEditar();
    };

    const handleView = (paciente) => {
        setPacienteSelecionado(paciente);
        handleAbrirModalDetalhes();
    };

    const handleDelete = async (paciente) => {
        const confirmar = window.confirm("Tem certeza que deseja inativar este paciente?");
        if (confirmar) {
            try {
                const pacienteRef = doc(getFirestore(), "pacientes_cadastrados", paciente.id);
                await updateDoc(pacienteRef, { ativo: false });
                setPacientes(pacientes.map((item) =>
                    item.id === paciente.id ? { ...item, ativo: false } : item
                ));
                alert("Paciente inativado com sucesso!");
            } catch (error) {
                console.error("Erro ao inativar paciente:", error);
                alert("Erro ao inativar paciente.");
            }
        }
    };

    const handleAtualizarPaciente = async (dadosPaciente) => {
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
        if (isSubmitting) return;  // Evita múltiplas submissões

        setIsSubmitting(true);
        try {
            const firestore = getFirestore();
            const docRef = await addDoc(collection(firestore, "pacientes_cadastrados"), dadosPaciente);
            const novoPaciente = { id: docRef.id, ...dadosPaciente };
            setPacientes((prevPacientes) => [...prevPacientes, novoPaciente]);
            handleFecharModalCadastro();
            alert("Paciente adicionado com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar paciente:", error);
            alert("Erro ao adicionar paciente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const tableHead = ["Nome", "E-mail", "CPF", "Gênero", "Telefone", "Ações"];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
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
                            Pacientes Cadastrados
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
                                disabled={isSubmitting}  // Desabilita o botão enquanto está submetendo
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
                                {pacientes
                                    .filter((paciente) => {
                                        const searchLower = termoPesquisa.toLowerCase();
                                        return (
                                            paciente.nome.toLowerCase().includes(searchLower) ||
                                            paciente.email.toLowerCase().includes(searchLower) ||
                                            paciente.cpf.includes(searchLower)
                                        );
                                    })
                                    .map((paciente, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{paciente.nome}</TableCell>
                                            <TableCell>{paciente.email}</TableCell>
                                            <TableCell>{paciente.cpf}</TableCell>
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

                    {/* Modal para adicionar novo paciente */}
                    <Dialog open={modalCadastroAberto} onClose={handleFecharModalCadastro} fullWidth maxWidth="md">
                        <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
                        <DialogContent>
                            <CadastroPaciente onSalvar={handleAdicionarPaciente} />
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
                                    <Typography>CPF: {pacienteSelecionado.cpf}</Typography>
                                    <Typography>RG: {pacienteSelecionado.rg}</Typography>
                                    <Typography>Sexo Biológico: {pacienteSelecionado.sexoBiologico}</Typography>
                                    <Typography>Gênero: {pacienteSelecionado.genero}</Typography>
                                    <Typography>Data de Nascimento: {pacienteSelecionado.dataNascimento}</Typography>
                                    <Typography>CEP: {pacienteSelecionado.cep}</Typography>
                                    <Typography>Endereço: {pacienteSelecionado.endereco}</Typography>
                                    <Typography>Bairro: {pacienteSelecionado.bairro}</Typography>
                                    <Typography>Cidade: {pacienteSelecionado.cidade}</Typography>
                                    <Typography>Estado: {pacienteSelecionado.estado}</Typography>
                                    <Typography>Número da residência: {pacienteSelecionado.numeroResidencia}</Typography>
                                    <Typography>Telefone: {pacienteSelecionado.telefone}</Typography>
                                    <Typography><strong>Contato de Emergência:</strong> {pacienteSelecionado.contatoEmergencia}</Typography>
                                    {pacienteSelecionado.prontuarioAntigo && (
                                        <>
                                            <Typography>Número do Prontuário Antigo: {pacienteSelecionado.prontuarioAntigo}</Typography>
                                            <Typography>Localização do Prontuário Antigo: {pacienteSelecionado.localizacaoProntuarioAntigo}</Typography>
                                        </>
                                    )}
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
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        variant="outlined"
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
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="CPF"
                                        type="text"
                                        value={pacienteSelecionado.cpf}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="RG"
                                        type="text"
                                        value={pacienteSelecionado.rg}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Sexo Biológico"
                                        type="text"
                                        value={pacienteSelecionado.sexoBiologico}
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
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Telefone"
                                        type="text"
                                        value={pacienteSelecionado.telefone}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                telefone: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        label="Contato de Emergência"
                                        type="text"
                                        value={pacienteSelecionado.contatoEmergencia}
                                        onChange={(e) =>
                                            setPacienteSelecionado((prev) => ({
                                                ...prev,
                                                contatoEmergencia: e.target.value,
                                            }))
                                        }
                                        variant="outlined"
                                    />
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
                </div>
            </div>
        </ThemeProvider>
    );
};

export default PacientesCadastrados;
