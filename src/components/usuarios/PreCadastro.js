import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import InputMask from 'react-input-mask';
import { v4 as uuidv4 } from 'uuid';

const PreCadastro = ({ onSalvar, fecharModal }) => {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensagemAlerta, setMensagemAlerta] = useState({ tipo: '', texto: '' });
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const firestore = getFirestore();
  const auth = getAuth();

  const handleCloseAlert = () => {
    setMostrarAlerta(false);
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const validateForm = () => {
    const errors = [];
    if (!nome) errors.push("Nome é obrigatório.");
    if (!dataNascimento) errors.push("Data de nascimento é obrigatória.");
    if (!cpf) {
      errors.push("CPF é obrigatório.");
    } else if (!validarCPF(cpf)) {
      errors.push("CPF inválido.");
    }
    if (!telefone) errors.push("Telefone é obrigatório.");
    if (errors.length > 0) {
      exibirMensagemAlerta("warning", errors.join(" "));
      return false;
    }
    return true;
  };

  const exibirMensagemAlerta = (tipo, texto) => {
    setMensagemAlerta({ tipo, texto });
    setMostrarAlerta(true);
  };

  const buscarPacientePorCPF = async (cpf) => {
    const q = query(collection(firestore, "pacientes_cadastrados"), where("cpf", "==", cpf));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0];
    }
    return null;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const uid = auth.currentUser ? auth.currentUser.uid : uuidv4();

      const pacienteExistente = await buscarPacientePorCPF(cpf);
      const numeroProntuario = pacienteExistente?.data().numeroProntuario || String(Date.now()).slice(-7);

      const pacienteData = {
        nome,
        dataNascimento,
        cpf,
        telefone,
        numeroProntuario,
        rg: pacienteExistente?.data().rg || '',
        sexoBiologico: pacienteExistente?.data().sexoBiologico || '',
        genero: pacienteExistente?.data().genero || '',
        cep: pacienteExistente?.data().cep || '',
        endereco: pacienteExistente?.data().endereco || '',
        bairro: pacienteExistente?.data().bairro || '',
        cidade: pacienteExistente?.data().cidade || '',
        estado: pacienteExistente?.data().estado || '',
        numeroResidencia: pacienteExistente?.data().numeroResidencia || '',
        email: pacienteExistente?.data().email || '',
        temProntuarioAntigo: pacienteExistente?.data().temProntuarioAntigo || false,
        prontuarioAntigo: pacienteExistente?.data().prontuarioAntigo || '',
        localizacaoProntuarioAntigo: pacienteExistente?.data().localizacaoProntuarioAntigo || '',
        pacienteFalecido: pacienteExistente?.data().pacienteFalecido || false,
        outrosDados: pacienteExistente?.data().outrosDados || '',
        dataCadastro: pacienteExistente?.data().dataCadastro || new Date(),
      };

      const docRef = doc(firestore, "pacientes_cadastrados", uid);
      await setDoc(docRef, pacienteData);

      exibirMensagemAlerta("success", `Pré-cadastro realizado com sucesso! Prontuário: ${numeroProntuario}`);
      onSalvar && onSalvar(uid);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      exibirMensagemAlerta("error", "Erro ao realizar o pré-cadastro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Pré-Cadastro
        </Typography>
        <TextField
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Data de Nascimento"
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <InputMask
          mask="999.999.999-99"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        >
          {() => (
            <TextField
              label="CPF"
              fullWidth
              margin="normal"
            />
          )}
        </InputMask>
        <InputMask
          mask="(99) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        >
          {() => (
            <TextField
              label="Telefone"
              fullWidth
              margin="normal"
            />
          )}
        </InputMask>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Enviando..." : "Cadastrar"}
        </Button>
      </Box>
      <Snackbar
        open={mostrarAlerta}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert onClose={handleCloseAlert} severity={mensagemAlerta.tipo}>
          {mensagemAlerta.texto}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PreCadastro;
