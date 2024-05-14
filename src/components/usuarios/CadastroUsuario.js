//CadastroUsuario.js
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, getFirestore, setDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import temaUNNA from "../../temas"; // Ajuste o caminho conforme necessário
import MenuPrincipal from "../menu/MenuPrincipal";
import useStyles from "./CadastroUsuarioStyles";

const CadastroUsuario = ({ atualizarListaColaboradores, fecharModal }) => {
  // eslint-disable-next-line
  const navigate = useNavigate();
  const styles = useStyles();

  const auth = getAuth();
  const firestore = getFirestore();

  const [funcoes, setFuncoes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [temEspecialidade, setTemEspecialidade] = useState(false);
  const [especialidade, setEspecialidade] = useState("");

  // Função para formatar CPF
  const formatarCPF = (valor) => {
    const apenasDigitos = valor.replace(/\D/g, "").slice(0, 11);
    const cpfFormatado = apenasDigitos.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4"
    );
    return cpfFormatado;
  };

  // Função que lida com a mudança do campo de CPF e formata o valor
  const handleChangeCPF = (e) => {
    const cpfFormatado = formatarCPF(e.target.value);
    setCpf(cpfFormatado);
  };

  // Estados do componente
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [cep, setCep] = useState("");
  const [numeroResidencia, setNumeroResidencia] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [idFuncao, setIdFuncao] = useState("");
  const [senha, setSenha] = useState("");
  const [identificacaoProfissional, setIdentificacaoProfissional] = useState("");
  const [mensagemAlerta, setMensagemAlerta] = useState({ tipo: "", texto: "" });
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const buscarEnderecoPorCep = async (cep) => {
    if (cep.length === 8) {
      try {
        const response = await axios.get(
          `https://viacep.com.br/ws/${cep}/json/`
        );
        if (!response.data.erro) {
          setEndereco(response.data.logradouro);
          setBairro(response.data.bairro);
          setCidade(response.data.localidade);
          setEstado(response.data.uf);
        } else {
          alert("Erro: CEP não encontrado.");
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao buscar o CEP.");
      }
    }
  };

  const exibirMensagemAlerta = (tipo, texto) => {
    setMensagemAlerta({ tipo, texto });
    setMostrarAlerta(true);
  };

  useEffect(() => {
    const carregarFuncoes = async () => {
      try {
        const collectionRef = collection(firestore, 'dbo.usuario');

        const snapshot = await getDocs(collectionRef);
        const funcoesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFuncoes(funcoesData);
      } catch (error) {
        console.error("Erro ao carregar funções:", error);
      }
    };

    const carregarEspecialidades = async () => {
      try {
        const collectionRef = collection(firestore, 'dbo.especialidades');
        const snapshot = await getDocs(collectionRef);
        const especialidadesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEspecialidades(especialidadesData);
      } catch (error) {
        console.error("Erro ao carregar especialidades:", error);
      }
    };

    carregarFuncoes();
    carregarEspecialidades();
  }, [firestore]);

  const cadastrarUsuario = async () => {
    if (
      !nome ||
      !cpf ||
      !rg ||
      !endereco ||
      !cep ||
      !numeroResidencia ||
      !email ||
      !telefone ||
      !idFuncao ||
      !senha
    ) {
      exibirMensagemAlerta("warning", "Por favor, preencha todos os campos.");
      console.log("cadastrarUsuario chamada");
      return;
    }

    try {
      const usuario = await createUserWithEmailAndPassword(auth, email, senha);
      console.log("Colaborador criado:", usuario);

      const docRef = doc(firestore, "usuarios_cadastrados", usuario.user.uid);

      const createdUser = {
        nome,
        cpf,
        rg,
        endereco,
        bairro,
        cidade,
        estado,
        cep,
        numeroResidencia,
        email,
        telefone,
        idFuncao,
        identificacaoProfissional,
        especialidade: temEspecialidade ? especialidade : null,
        uid: usuario.user.uid,
      };

      await setDoc(docRef, createdUser);

      exibirMensagemAlerta("success", "Colaborador cadastrado com sucesso!");

      // Atualiza a lista de colaboradores e fecha o modal
      if (atualizarListaColaboradores) {
        atualizarListaColaboradores();
      }

      if (fecharModal) {
        fecharModal();
      }
    } catch (error) {
      console.error("Erro ao salvar no Firestore:", error);
      if (error.code === "auth/email-already-in-use") {
        exibirMensagemAlerta(
          "error",
          "Erro ao cadastrar Colaborador: e-mail já em uso."
        );
      } else {
        exibirMensagemAlerta("error", "Sem comunicação com o banco de dados.");
      }
    }
  };

  return (
    <ThemeProvider theme={temaUNNA}>
      <Container maxWidth="sm">
        <MenuPrincipal />
        {mostrarAlerta && (
          <Alert severity={mensagemAlerta.tipo} sx={{ marginBottom: 2 }}>
            {mensagemAlerta.texto}
          </Alert>
        )}
        <Box
          component="form"
          sx={styles.formContainer}
          noValidate
          autoComplete="off"
        >
          <TextField
            fullWidth
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="CPF"
            value={cpf}
            onChange={handleChangeCPF} // Aqui você utiliza o handleChangeCPF
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="RG"
            value={rg}
            onChange={(e) => setRg(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="CEP"
            value={cep}
            onBlur={() => buscarEnderecoPorCep(cep)}
            onChange={(e) => setCep(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={false}
          />
          <TextField
            fullWidth
            label="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled
          />
          <TextField
            fullWidth
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled
          />
          <TextField
            fullWidth
            label="Número da residência"
            value={numeroResidencia}
            onChange={(e) => setNumeroResidencia(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            margin="normal"
            variant="outlined"
            type="password"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Função</InputLabel>
            <Select
              value={idFuncao}
              onChange={(e) => setIdFuncao(e.target.value)}
              label="Função"
            >
              {funcoes.map((funcao) => (
                <MenuItem key={funcao.id} value={funcao.id}>
                  {funcao.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Identificação Profissional"
            placeholder="Insira seu CRM, CRN, CRO"
            value={identificacaoProfissional}
            onChange={(e) => setIdentificacaoProfissional(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={temEspecialidade}
                onChange={() => setTemEspecialidade(!temEspecialidade)}
              />
            }
            label="Possui alguma especialidade médica?"
          />
          {temEspecialidade && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Especialidade</InputLabel>
              <Select
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                label="Especialidade"
              >
                {especialidades.map((especialidade) => (
                  <MenuItem key={especialidade.id} value={especialidade.id}>
                    {especialidade.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={cadastrarUsuario}
            sx={styles.submitButton}
          >
            Cadastrar
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default CadastroUsuario;
