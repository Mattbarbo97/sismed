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
    Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import temaUNNA from "../../temas";
import MenuPrincipal from "../menu/MenuPrincipal";
import CadastroUsuario from "./CadastroUsuario";
import "./UsuariosCadastrados.css";

const AcoesUsuario = ({ usuario, onEdit, onDelete, onView }) => {
    return (
        <>
            <IconButton color="primary" onClick={() => onEdit(usuario)}>
                <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => onDelete(usuario)}>
                <DeleteIcon />
            </IconButton>
            <IconButton onClick={() => onView(usuario)}>
                <VisibilityIcon />
            </IconButton>
        </>
    );
};

const ModalDetalhesUsuario = ({
    usuario,
    aberto,
    fecharModal,
    modoEdicao,
    onSave,
}) => {
    const [editandoUsuario, setEditandoUsuario] = useState(usuario);

    useEffect(() => {
        setEditandoUsuario(usuario); // Atualiza quando o usuário muda
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditandoUsuario((prev) => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        fecharModal();
        if (modoEdicao) {
            onSave(editandoUsuario);
        }
    };

    return (
        <Dialog open={aberto} onClose={handleClose}>
            <DialogTitle>
                {modoEdicao ? "Editar Usuário" : "Detalhes do Usuário"}
            </DialogTitle>
            <DialogContent>
                {modoEdicao ? (
                    <>
                        <TextField
                            margin="dense"
                            label="Nome"
                            type="text"
                            fullWidth
                            name="nome"
                            value={editandoUsuario?.nome || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Email"
                            type="email"
                            fullWidth
                            name="email"
                            value={editandoUsuario?.email || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="CPF"
                            type="text"
                            fullWidth
                            name="cpf"
                            value={editandoUsuario?.cpf || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Função"
                            type="text"
                            fullWidth
                            name="funcao"
                            value={editandoUsuario?.funcao || ""}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    <>
                        <Typography>Nome: {usuario?.nome}</Typography>
                        <Typography>Email: {usuario?.email}</Typography>
                        <Typography>CPF: {usuario?.cpf}</Typography>
                        <Typography>Função: {usuario?.funcao}</Typography>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    {modoEdicao ? "Salvar" : "Fechar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const UsuariosCadastrados = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [termoPesquisa, setTermoPesquisa] = useState("");

    // No componente pai
    const handleSalvarUsuario = async (dadosUsuario) => {
        try {
            // Aqui vai a lógica para salvar os dados do usuário
            // Por exemplo, chamar uma API ou adicionar ao Firestore
            console.log(dadosUsuario); // Apenas para depuração
            // Fechar o modal após o salvamento ser bem-sucedido
            handleFecharModalCadastro();
        } catch (error) {
            console.error("Erro ao salvar usuário:", error);
            // Aqui você pode definir como quer tratar os erros
            // Por exemplo, mostrar uma mensagem para o usuário
        }
    };

    //modal de cadstro
    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
    // Função para abrir o modal de CadastroUsuario
    const handleAbrirModalCadastro = () => {
        setModalCadastroAberto(true);
    };
    // Função para fechar o modal de CadastroUsuario
    const handleFecharModalCadastro = () => {
        setModalCadastroAberto(false);
    };

    const handleSearchChange = (event) => {
        setTermoPesquisa(event.target.value);
    };

    const handleDelete = async (usuario) => {
        const confirmar = window.confirm(
            "Tem certeza que deseja excluir este usuário?"
        );
        if (confirmar) {
            try {
                const docRef = doc(
                    getFirestore(),
                    "usuarios_cadastrados",
                    usuario.id
                );
                await deleteDoc(docRef);
                setUsuarios(usuarios.filter((user) => user.id !== usuario.id));
                alert("Usuário excluído com sucesso!");
            } catch (error) {
                console.error("Erro ao excluir usuário:", error);
                alert("Erro ao excluir usuário.");
            }
        }
    };

    const handleAbrirModal = (usuario) => {
        setUsuarioSelecionado(usuario);
        setModoEdicao(false);
        setModalAberto(true);
    };

    const handleEdit = (usuario) => {
        setUsuarioSelecionado(usuario);
        setModoEdicao(true);
        setModalAberto(true);
    };

    const handleSaveEdicao = async (usuarioEditado) => {
        if (!usuarioEditado.funcao) {
            console.error("Erro: Função do usuário não definida.");
            return;
        }
        try {
            const docRef = doc(
                getFirestore(),
                "usuarios_cadastrados",
                usuarioEditado.id
            );
            await updateDoc(docRef, {
                nome: usuarioEditado.nome,
                email: usuarioEditado.email,
                cpf: usuarioEditado.cpf,
                funcao: usuarioEditado.funcao,
            });
            setUsuarios(
                usuarios.map((user) =>
                    user.id === usuarioEditado.id ? usuarioEditado : user
                )
            );
            setModalAberto(false);
            alert("Usuário atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            alert("Erro ao atualizar usuário.");
        }
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setUsuarioSelecionado(null);
    };

    useEffect(() => {
        const fetchUsuarios = async () => {
            setLoading(true);
            const firestore = getFirestore();
            const usuariosCollectionRef = collection(
                firestore,
                "usuarios_cadastrados"
            );
            try {
                const snapshot = await getDocs(usuariosCollectionRef);
                const usuariosList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsuarios(usuariosList);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            }
            setLoading(false);
        };

        fetchUsuarios();
    }, []);
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
            <div className="usuarios-container">
                <MenuPrincipal />
                <div className="usuarios-content">
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="left"
                        marginBottom="2rem"
                    >
                        {/* Título alinhado à esquerda */}
                        <Typography variant="h4" gutterBottom>
                            Colaboradores Cadastrados
                        </Typography>

                        {/* Caixa para a pesquisa e o botão, alinhados à direita */}
                        <Box display="flex" alignItems="center">
                            <TextField
                                label="Pesquisar Usuário"
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
                                style={{ marginRight: "1rem" }} // Mantém espaço entre a barra de pesquisa e o botão
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAbrirModalCadastro}
                            >
                                Novo Usuário
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {[
                                        "Nome",
                                        "E-mail",
                                        "CPF",
                                        "Função",
                                        "Ações",
                                    ].map((headItem) => (
                                        <TableCell
                                            key={headItem}
                                            style={{ fontWeight: 600 }}
                                        >
                                            {headItem}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usuarios
                                    .filter(
                                        (usuario) =>
                                            usuario.nome
                                                .toLowerCase()
                                                .includes(
                                                    termoPesquisa.toLowerCase()
                                                ) ||
                                            usuario.email
                                                .toLowerCase()
                                                .includes(
                                                    termoPesquisa.toLowerCase()
                                                ) ||
                                            usuario.cpf.includes(
                                                termoPesquisa
                                            ) ||
                                            (usuario.funcao &&
                                                usuario.funcao
                                                    .toLowerCase()
                                                    .includes(
                                                        termoPesquisa.toLowerCase()
                                                    ))
                                    )
                                    .map((usuario) => (
                                        <TableRow key={usuario.id}>
                                            <TableCell>
                                                {usuario.nome}
                                            </TableCell>
                                            <TableCell>
                                                {usuario.email}
                                            </TableCell>
                                            <TableCell>{usuario.cpf}</TableCell>
                                            <TableCell>
                                                {usuario.funcao}
                                            </TableCell>
                                            <TableCell>
                                                <AcoesUsuario
                                                    usuario={usuario}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                    onView={handleAbrirModal}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* cadastro de usuario do modal */}
                    <Dialog
                        open={modalCadastroAberto}
                        onClose={handleFecharModalCadastro}
                        fullWidth
                        maxWidth="md" // ou outro tamanho que você preferir
                    >
                        <DialogTitle className="DialogTitle">
                            Cadastrar Novo Usuário
                        </DialogTitle>

                        <DialogContent>
                            {/* Passando a função handleSalvarUsuario como prop para CadastroUsuario */}
                            <CadastroUsuario onSalvar={handleSalvarUsuario} />
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleFecharModalCadastro}>
                                Cancelar
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {usuarioSelecionado && (
                        <ModalDetalhesUsuario
                            usuario={usuarioSelecionado}
                            aberto={modalAberto}
                            fecharModal={handleFecharModal}
                            modoEdicao={modoEdicao}
                            onSave={handleSaveEdicao}
                        />
                    )}
                </div>
            </div>
        </ThemeProvider>
    );
};

export default UsuariosCadastrados;
