import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import temaUNNA from "../../temas"; // Ajuste o caminho conforme necessário
import MenuPrincipal from "../menu/MenuPrincipal";
import useStyles from "./CadastroUsuarioStyles";

const CadastroUsuario = () => {
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
  const [identificacaoProfissional, setIdentificacaoProfissional] =
    useState("");
  const [mensagemAlerta, setMensagemAlerta] = useState({ tipo: "", texto: "" });
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  useEffect(() => {
    let timer;
    if (mostrarAlerta) {
      timer = setTimeout(() => {
        setMostrarAlerta(false);
      }, 5000); // Mensagem desaparece após 5 segundos
    }
    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }, [mostrarAlerta]);

  const exibirMensagemAlerta = (tipo, texto) => {
    setMensagemAlerta({ tipo, texto });
    setMostrarAlerta(true);
  };

  const funcoes = {
    1: "Médico",
    2: "Nutricionista",
    3: "Enfermeiro",
    4: "Dentista",
    5: "Secretária",
    99: "Admin",
  };

  const styles = useStyles();

  const auth = getAuth();
  const firestore = getFirestore();

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
      console.log("Usuário criado:", usuario);

      const docRef = doc(firestore, "usuarios_cadastrados", usuario.user.uid);

      const createdUser = {
        nome,
        cpf,
        rg,
        endereco,
        cep,
        numeroResidencia,
        email,
        telefone,
        idFuncao,
        identificacaoProfissional,
        uid: usuario.user.uid,
      };

      await setDoc(docRef, createdUser);

      exibirMensagemAlerta("success", "Usuário cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar no Firestore:", error);
      if (error.code === "auth/email-already-in-use") {
        exibirMensagemAlerta(
          "error",
          "Erro ao cadastrar usuário: e-mail já em uso."
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
            disabled
          />
          <TextField
            fullWidth
            label="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={bairro !== ""}
          />

          <TextField
            fullWidth
            label="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={cidade !== ""}
          />

          <TextField
            fullWidth
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={estado !== ""}
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
              {Object.entries(funcoes).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {["1", "2", "3", "4"].includes(idFuncao) && (
            <TextField
              fullWidth
              label="Identificação Profissional"
              value={identificacaoProfissional}
              onChange={(e) => setIdentificacaoProfissional(e.target.value)}
              margin="normal"
              variant="outlined"
            />
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
