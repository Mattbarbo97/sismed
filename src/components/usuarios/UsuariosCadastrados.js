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
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import {
    collection,
    doc,
    getDocs,
    getFirestore,
    updateDoc,
    getDoc
} from "firebase/firestore";
import temaUNNA from "../../temas";
import MenuPrincipal from "../menu/MenuPrincipal";
import CadastroUsuario from "./CadastroUsuario";
import "./UsuariosCadastrados.css";

const AcoesUsuario = ({ usuario, onEdit, onDelete, onView, onReactivate }) => {
    return (
        <>
            <IconButton color="primary" onClick={() => onEdit(usuario)}>
                <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => onDelete(usuario)}>
                <DeleteIcon />
            </IconButton>
            {usuario.ativo === false && (
                <IconButton color="default" onClick={() => onReactivate(usuario)}>
                    <RefreshIcon />
                </IconButton>
            )}
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
    const [especialidades, setEspecialidades] = useState([]);
    const [funcoes, setFuncoes] = useState([]);
    const [possuiEspecialidade, setPossuiEspecialidade] = useState(false);
    const [especialidadeMultipla, setEspecialidadeMultipla] = useState(false);

    useEffect(() => {
        const fetchEspecialidades = async () => {
            const db = getFirestore();
            const especialidadesSnapshot = await getDocs(collection(db, "dbo.especialidades"));
            const especialidadesList = especialidadesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEspecialidades(especialidadesList);
        };

        const fetchFuncoes = async () => {
            const db = getFirestore();
            const funcoesSnapshot = await getDocs(collection(db, "dbo.usuario"));
            const funcoesList = funcoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFuncoes(funcoesList);
        };

        fetchEspecialidades();
        fetchFuncoes();
        setEditandoUsuario(usuario);
        setPossuiEspecialidade(usuario.especialidades && usuario.especialidades.length > 0);
        setEspecialidadeMultipla(usuario.especialidades && usuario.especialidades.length > 1);
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditandoUsuario((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const checked = e.target.checked;
        setPossuiEspecialidade(checked);
        if (!checked) {
            setEditandoUsuario((prev) => ({ ...prev, especialidades: [] }));
        }
    };

    const handleEspecialidadeMultiplaChange = (e) => {
        const checked = e.target.checked;
        setEspecialidadeMultipla(checked);
    };

    const addEspecialidade = () => {
        setEditandoUsuario((prev) => ({
            ...prev,
            especialidades: [...(prev.especialidades || []), ""]
        }));
    };

    const handleEspecialidadeChange = (index, value) => {
        setEditandoUsuario((prev) => {
            const updatedEspecialidades = [...prev.especialidades];
            updatedEspecialidades[index] = value;
            return { ...prev, especialidades: updatedEspecialidades };
        });
    };

    const removeEspecialidade = (index) => {
        setEditandoUsuario((prev) => {
            const updatedEspecialidades = [...prev.especialidades];
            updatedEspecialidades.splice(index, 1);
            return { ...prev, especialidades: updatedEspecialidades };
        });
    };

    const handleClose = () => {
        fecharModal();
    };

    const handleSave = () => {
        if (modoEdicao) {
            onSave(editandoUsuario);
        }
        fecharModal();
    };

    return (
        <Dialog open={aberto} onClose={handleClose}>
            <DialogTitle>
                {modoEdicao ? "Editar Colaborador" : "Detalhes do Colaborador"}
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
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            margin="dense"
                            label="RG"
                            type="text"
                            fullWidth
                            name="rg"
                            value={editandoUsuario?.rg || ""}
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            margin="dense"
                            label="CPF"
                            type="text"
                            fullWidth
                            name="cpf"
                            value={editandoUsuario?.cpf || ""}
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            margin="dense"
                            label="Identificação do Profissional"
                            type="text"
                            fullWidth
                            name="identificacaoProfissional"
                            value={editandoUsuario?.identificacaoProfissional || ""}
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            margin="dense"
                            label="E-mail"
                            type="email"
                            fullWidth
                            name="email"
                            value={editandoUsuario?.email || ""}
                            onChange={handleChange}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Função</InputLabel>
                            <Select
                                value={editandoUsuario?.funcao || ""}
                                onChange={handleChange}
                                name="funcao"
                            >
                                {funcoes.map((func) => (
                                    <MenuItem key={func.id} value={func.nome}>
                                        {func.nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            label="CEP"
                            type="text"
                            fullWidth
                            name="cep"
                            value={editandoUsuario?.cep || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Endereço"
                            type="text"
                            fullWidth
                            name="endereco"
                            value={editandoUsuario?.endereco || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Bairro"
                            type="text"
                            fullWidth
                            name="bairro"
                            value={editandoUsuario?.bairro || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Cidade"
                            type="text"
                            fullWidth
                            name="cidade"
                            value={editandoUsuario?.cidade || ""}
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            margin="dense"
                            label="Estado"
                            type="text"
                            fullWidth
                            name="estado"
                            value={editandoUsuario?.estado || ""}
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            margin="dense"
                            label="Telefone"
                            type="text"
                            fullWidth
                            name="telefone"
                            value={editandoUsuario?.telefone || ""}
                            onChange={handleChange}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={possuiEspecialidade}
                                    onChange={handleCheckboxChange}
                                />
                            }
                            label="Possui especialidade?"
                        />
                        {possuiEspecialidade && (
                            <div>
                                {editandoUsuario.especialidades &&
                                    editandoUsuario.especialidades.map((especialidade, index) => (
                                        <Box key={index} display="flex" alignItems="center">
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>Especialidade</InputLabel>
                                                <Select
                                                    value={especialidade}
                                                    onChange={(e) => handleEspecialidadeChange(index, e.target.value)}
                                                >
                                                    {especialidades.map((esp) => (
                                                        <MenuItem key={esp.id} value={esp.nome}>
                                                            {esp.nome}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <IconButton onClick={() => removeEspecialidade(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                <Button onClick={addEspecialidade}>Adicionar Especialidade</Button>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={especialidadeMultipla}
                                            onChange={handleEspecialidadeMultiplaChange}
                                        />
                                    }
                                    label="Possui mais de uma especialidade?"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <Typography>Nome: {usuario?.nome}</Typography>
                        <Typography>RG: {usuario?.rg}</Typography>
                        <Typography>CPF: {usuario?.cpf}</Typography>
                        <Typography>Identificação do Profissional: {usuario?.identificacaoProfissional}</Typography>
                        <Typography>E-mail: {usuario?.email}</Typography>
                        <Typography>Função: {usuario?.funcao}</Typography>
                        <Typography>CEP: {usuario?.cep}</Typography>
                        <Typography>Endereço: {usuario?.endereco}</Typography>
                        <Typography>Bairro: {usuario?.bairro}</Typography>
                        <Typography>Cidade: {usuario?.cidade}</Typography>
                        <Typography>Estado: {usuario?.estado}</Typography>
                        <Typography>Telefone: {usuario?.telefone}</Typography>
                        {usuario?.especialidades &&
                            usuario.especialidades.map((especialidade, index) => (
                                <Typography key={index}>Especialidade: {especialidade}</Typography>
                            ))}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    {modoEdicao ? "Cancelar" : "Fechar"}
                </Button>
                {modoEdicao && (
                    <Button onClick={handleSave}>
                        Salvar
                    </Button>
                )}
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

    const fetchUsuarios = async () => {
        setLoading(true);
        const firestore = getFirestore();
        const usuariosCollectionRef = collection(firestore, "usuarios_cadastrados");
        try {
            const snapshot = await getDocs(usuariosCollectionRef);
            const usuariosList = [];
            for (const docSnap of snapshot.docs) {
                const userData = docSnap.data();
                console.log("Dados do Colaborador:", userData); // Adicionar este log para verificar os dados do Colaborador
                // Inicializa a propriedade "funcao" como uma string vazia caso não exista
                userData.funcao = userData.funcao || "";
                userData.ativo = userData.ativo !== false; // Define o usuário como ativo se a propriedade não existir
                // Busca o nome da função usando o idFuncao na coleção dbo.usuario
                const docRefFuncao = doc(firestore, "dbo.usuario", userData.idFuncao);
                console.log("Referência do documento da função:", docRefFuncao); // Adicionar este log para verificar a referência do documento
                const docSnapFuncao = await getDoc(docRefFuncao);
                console.log("Snapshot da função:", docSnapFuncao); // Adicionar este log para verificar o snapshot da função
                if (docSnapFuncao.exists()) {
                    const funcaoData = docSnapFuncao.data();
                    userData.funcao = funcaoData.nome || "";
                }

                // Busca o nome da especialidade usando o UID na coleção dbo.especialidades
                if (userData.especialidade) {
                    const docRefEspecialidade = doc(firestore, "dbo.especialidades", userData.especialidade);
                    const docSnapEspecialidade = await getDoc(docRefEspecialidade);
                    if (docSnapEspecialidade.exists()) {
                        const especialidadeData = docSnapEspecialidade.data();
                        userData.especialidade = especialidadeData.nome || userData.especialidade;
                    }
                }

                usuariosList.push({
                    id: docSnap.id,
                    ...userData,
                });
            }
            setUsuarios(usuariosList);
        } catch (error) {
            console.error("Erro ao buscar Colaboradores:", error);
        }
        setLoading(false);
    };

    const handleSalvarUsuario = async (dadosUsuario) => {
        try {
            console.log(dadosUsuario);
            fetchUsuarios();
            handleFecharModalCadastro();
        } catch (error) {
            console.error("Erro ao salvar Colaborador:", error);
        }
    };

    const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

    const handleAbrirModalCadastro = () => {
        setModalCadastroAberto(true);
    };

    const handleFecharModalCadastro = () => {
        setModalCadastroAberto(false);
    };

    const handleSearchChange = (event) => {
        setTermoPesquisa(event.target.value);
    };

    const handleDelete = async (usuario) => {
        const confirmar = window.prompt(
            "Para desativar o usuário, digite 'desativar'"
        );
        if (confirmar === "desativar") {
            try {
                const docRef = doc(
                    getFirestore(),
                    "usuarios_cadastrados",
                    usuario.id
                );
                await updateDoc(docRef, {
                    ativo: false,
                });
                setUsuarios(
                    usuarios.map((user) =>
                        user.id === usuario.id ? { ...user, ativo: false } : user
                    )
                );
                alert("Colaborador desativado com sucesso!");
            } catch (error) {
                console.error("Erro ao desativar Colaborador:", error);
                alert("Erro ao desativar Colaborador.");
            }
        } else {
            alert("Ação de desativação cancelada.");
        }
    };

    const handleReactivate = async (usuario) => {
        try {
            const docRef = doc(
                getFirestore(),
                "usuarios_cadastrados",
                usuario.id
            );
            await updateDoc(docRef, {
                ativo: true,
            });
            setUsuarios(
                usuarios.map((user) =>
                    user.id === usuario.id ? { ...user, ativo: true } : user
                )
            );
            alert("Colaborador reativado com sucesso!");
        } catch (error) {
            console.error("Erro ao reativar Colaborador:", error);
            alert("Erro ao reativar Colaborador.");
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
            console.error("Erro: Função do Colaborador não definida.");
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
                identificacaoProfissional: usuarioEditado.identificacaoProfissional || null,
                especialidades: usuarioEditado.especialidades || [],
            });
            setUsuarios(
                usuarios.map((user) =>
                    user.id === usuarioEditado.id ? usuarioEditado : user
                )
            );
            setModalAberto(false);
            alert("Colaborador atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar Colaborador:", error);
            alert("Erro ao atualizar Colaborador.");
        }
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setUsuarioSelecionado(null);
    };

    useEffect(() => {
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
                        <Typography variant="h4" gutterBottom>
                            Colaboradores Cadastrados
                        </Typography>

                        <Box display="flex" alignItems="center">
                            <TextField
                                label="Pesquisar Colaborador"
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
                                Novo Colaborador
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
                                        <TableRow key={usuario.id} className={usuario.ativo === false ? "desativado" : ""}>
                                            <TableCell>
                                                {usuario.nome}
                                            </TableCell>
                                            <TableCell>
                                                {usuario.email}
                                            </TableCell>
                                            <TableCell>{usuario.cpf}</TableCell>
                                            <TableCell>
                                                {usuario.funcao || "Carregando..."}
                                            </TableCell>
                                            <TableCell>
                                                <AcoesUsuario
                                                    usuario={usuario}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                    onReactivate={handleReactivate}
                                                    onView={handleAbrirModal}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Dialog
                        open={modalCadastroAberto}
                        onClose={handleFecharModalCadastro}
                        fullWidth
                        maxWidth="md"
                    >
                        <DialogTitle className="DialogTitle">
                            Cadastrar Novo Colaborador
                        </DialogTitle>

                        <DialogContent>
                            <CadastroUsuario
                                atualizarListaColaboradores={fetchUsuarios}
                                fecharModal={handleFecharModalCadastro}
                            />
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
