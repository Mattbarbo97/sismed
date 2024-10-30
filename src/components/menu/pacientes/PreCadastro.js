import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

  const validateForm = () => {
    const errors = [];
    if (!nome) errors.push("Nome é obrigatório.");
    if (!dataNascimento) errors.push("Data de nascimento é obrigatória.");
    if (!cpf) errors.push("CPF é obrigatório.");
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

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const uid = auth.currentUser ? auth.currentUser.uid : "anonymous";

      // Estrutura do documento com campos em branco para preenchimento posterior
      const pacienteData = {
        nome,
        dataNascimento,
        cpf,
        telefone,
        rg: '',
        sexoBiologico: '',
        genero: '',
        cep: '',
        endereco: '',
        bairro: '',
        cidade: '',
        estado: '',
        numeroResidencia: '',
        email: '',
        temProntuarioAntigo: false,
        prontuarioAntigo: '',
        localizacaoProntuarioAntigo: '',
        pacienteFalecido: false,
        outrosDados: '', // Adicione outros campos conforme necessário
        dataCadastro: new Date()
      };

      const docRef = doc(firestore, "pacientes_cadastrados", uid);
      await setDoc(docRef, pacienteData);

      exibirMensagemAlerta("success", "Pré-cadastro realizado com sucesso!");
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
        <TextField
          label="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          fullWidth
          margin="normal"
        />
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
