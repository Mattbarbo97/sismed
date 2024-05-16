import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
} from "@mui/material";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    getFirestore,
    updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import temaUNNA from "../../../temas"; // Substitua pelo caminho correto para o seu tema
import MenuPrincipal from "../MenuPrincipal";
import CadastroPaciente from "./CadastroPaciente"; // Este é um componente fictício, substitua pelo nome correto
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
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const styles = useStyles();

    useEffect(() => {
        const firestore = getFirestore();
        const pacientesCollection = collection(
            firestore,
            "pacientes_cadastrados"
        );

        const listarPacientes = async () => {
            try {
                const snapshot = await getDocs(pacientesCollection);
                const pacientesList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPacientes(pacientesList);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        listarPacientes();
    }, []);

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

    const handleSearchChange = (event) => {
        setTermoPesquisa(event.target.value);
    };

    const handleEdit = (paciente) => {
        setUsuarioSelecionado(paciente);
        setModoEdicao(true);
        handleAbrirModalDetalhes();
    };

    const handleView = (paciente) => {
        setUsuarioSelecionado(paciente);
        setModoEdicao(false);
        handleAbrirModalDetalhes();
    };

    const handleDelete = async (paciente) => {
        const confirmar = window.confirm(
            "Tem certeza que deseja inativar este paciente?"
        );
        if (confirmar) {
            try {
                const pacienteRef = doc(
                    getFirestore(),
                    "pacientes_cadastrados",
                    paciente.id
                );
                await updateDoc(pacienteRef, {
                    ativo: false,
                });
                setPacientes(
                    pacientes.map((item) =>
                        item.id === paciente.id
                            ? { ...item, ativo: false }
                            : item
                    )
                );
                alert("Paciente inativado com sucesso!");
            } catch (error) {
                console.error("Erro ao inativar paciente:", error);
                alert("Erro ao inativar paciente.");
            }
        }
    };

    const handleAdicionarPaciente = async (dadosPaciente) => {
        try {
            const firestore = getFirestore();
            const docRef = await addDoc(
                collection(firestore, "pacientes_cadastrados"),
                dadosPaciente
            );
            setPacientes([...pacientes, { id: docRef.id, ...dadosPaciente }]);
            alert("Paciente adicionado com sucesso!");
            handleFecharModalCadastro();
        } catch (error) {
            console.error("Erro ao adicionar paciente:", error);
            alert("Erro ao adicionar paciente.");
        }
    };

    const tableHead = ["Nome", "E-mail", "CPF", "Gênero", "Telefone", "Ações"];

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={temaUNNA}>
            <div className={styles.usuariosContainer}>
                <MenuPrincipal />
                <div className={styles.usuariosContent}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="left"
                        marginBottom="2rem"
                    >
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
                                            <IconButton
                                                onClick={() =>
                                                    console.log("Pesquisar")
                                                }
                                            >
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
                                        <TableCell key={index}>
                                            {headItem}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pacientes
                                    .filter((paciente) => {
                                        const searchLower =
                                            termoPesquisa.toLowerCase();
                                        return (
                                            paciente.nome
                                                .toLowerCase()
                                                .includes(searchLower) ||
                                            paciente.email
                                                .toLowerCase()
                                                .includes(searchLower) ||
                                            paciente.cpf.includes(searchLower)
                                        );
                                    })
                                    .map((paciente, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {paciente.nome}
                                            </TableCell>
                                            <TableCell>
                                                {paciente.email}
                                            </TableCell>
                                            <TableCell>
                                                {paciente.cpf}
                                            </TableCell>
                                            <TableCell>
                                                {paciente.genero}
                                            </TableCell>
                                            <TableCell>
                                                {paciente.telefone}
                                            </TableCell>
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
                    <Dialog
                        open={modalCadastroAberto}
                        onClose={handleFecharModalCadastro}
                        fullWidth
                        maxWidth="md"
                    >
                        <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
                        <DialogContent>
                            <CadastroPaciente
                                onSalvar={handleAdicionarPaciente}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleFecharModalCadastro}>
                                Cancelar
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Modal para visualizar ou editar paciente */}
                    <Dialog
                        open={modalDetalhesAberto}
                        onClose={handleFecharModalDetalhes}
                        fullWidth
                        maxWidth="md"
                    >
                        <DialogTitle>
                            {modoEdicao
                                ? "Editar Paciente"
                                : "Detalhes do Paciente"}
                        </DialogTitle>
                        <DialogContent>
                            <CadastroPaciente
                                paciente={usuarioSelecionado}
                                modoEdicao={modoEdicao}
                                onSalvar={handleAdicionarPaciente}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleFecharModalDetalhes}>
                                Fechar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default PacientesCadastrados;

//adicionar ´numero de prontuario antigo
