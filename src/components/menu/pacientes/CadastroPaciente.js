import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, MenuItem, FormControl, InputLabel, Select, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { getFirestore, collection, query, where, getDocs, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import MenuPrincipal from '../MenuPrincipal'; // Ajuste o caminho conforme necessário
import useStyles from './CadastroPacienteStyles';

const CadastroPaciente = ({ onSalvar, fecharModal }) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfLimpo, setCpfLimpo] = useState('');
  const [rg, setRg] = useState('');
  const [sexoBiologico, setSexoBiologico] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [numeroResidencia, setNumeroResidencia] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [temProntuarioAntigo, setTemProntuarioAntigo] = useState(false);
  const [prontuarioAntigo, setProntuarioAntigo] = useState('');
  const [localizacaoProntuarioAntigo, setLocalizacaoProntuarioAntigo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensagemAlerta, setMensagemAlerta] = useState({ tipo: '', texto: '' });
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const styles = useStyles();
  const auth = getAuth();
  const firestore = getFirestore();

  const buscarEnderecoPorCep = async (cep) => {
    if (cep.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.data.erro) {
          setEndereco(response.data.logradouro);
          setBairro(response.data.bairro);
          setCidade(response.data.localidade);
          setEstado(response.data.uf);
        } else {
          alert('Erro: CEP não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar o CEP:', error);
        alert('Erro ao buscar o CEP.');
      }
    }
  };

  const formatarCPF = (valor) => {
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 11);
    const cpfFormatado = apenasDigitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return cpfFormatado;
  };

  const handleChangeCPF = (e) => {
    const cpfFormatado = formatarCPF(e.target.value);
    const cpfLimpo = e.target.value.replace(/\D/g, '');
    setCpf(cpfFormatado);
    setCpfLimpo(cpfLimpo);
  };

  const exibirMensagemAlerta = (tipo, texto) => {
    setMensagemAlerta({ tipo, texto });
    setMostrarAlerta(true);
  };

  const buscarPacientePorCPF = async (cpf) => {
    const q = query(collection(firestore, 'pacientes_cadastrados'), where('cpf', '==', cpf));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const buscarUltimoNumeroProntuario = async () => {
    const q = query(collection(firestore, 'pacientes_cadastrados'), orderBy('numeroProntuario', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const ultimoPaciente = querySnapshot.docs[0].data();
      return parseInt(ultimoPaciente.numeroProntuario, 10) + 1;
    } else {
      return 1;
    }
  };

  const cadastrarPaciente = async () => {
    if (isSubmitting) return;

    if (!nome || !cpf || !rg || !endereco || !cep || !numeroResidencia || !email || !telefone || !dataNascimento) {
      exibirMensagemAlerta("warning", "Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const pacienteJaExiste = await buscarPacientePorCPF(cpfLimpo);
      if (pacienteJaExiste) {
        exibirMensagemAlerta("error", "Erro: Paciente com este CPF já está cadastrado.");
        setIsSubmitting(false);
        return;
      }

      const numeroProntuario = await buscarUltimoNumeroProntuario();
      const prontuarioFormatado = String(numeroProntuario).padStart(7, '0');

      const usuario = await createUserWithEmailAndPassword(auth, email, "senhaPadrao");
      const docRef = doc(firestore, "pacientes_cadastrados", usuario.user.uid);

      const pacienteData = {
        nome,
        cpf: cpfLimpo,
        rg,
        sexoBiologico,
        genero,
        dataNascimento,
        endereco,
        bairro,
        cidade,
        estado,
        cep,
        numeroResidencia,
        email,
        telefone,
        numeroProntuario: prontuarioFormatado
      };

      if (temProntuarioAntigo) {
        pacienteData.prontuarioAntigo = prontuarioAntigo;
        pacienteData.localizacaoProntuarioAntigo = localizacaoProntuarioAntigo;
      }

      await setDoc(docRef, pacienteData);

      exibirMensagemAlerta("success", "Paciente cadastrado com sucesso!");
      onSalvar(pacienteData);

      if (fecharModal) {
        fecharModal();
      }

      // Limpa o formulário após o cadastro
      setNome('');
      setCpf('');
      setCpfLimpo('');
      setRg('');
      setSexoBiologico('');
      setGenero('');
      setDataNascimento('');
      setCep('');
      setEndereco('');
      setBairro('');
      setCidade('');
      setEstado('');
      setNumeroResidencia('');
      setEmail('');
      setTelefone('');
      setTemProntuarioAntigo(false);
      setProntuarioAntigo('');
      setLocalizacaoProntuarioAntigo('');

      // Atualiza a página após o cadastro
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar no Firestore:', error);
      exibirMensagemAlerta("error", "Erro: Ocorreu um erro ao cadastrar o paciente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <MenuPrincipal />
      {mostrarAlerta && (
        <Alert severity={mensagemAlerta.tipo} sx={{ marginBottom: 2 }}>
          {mensagemAlerta.texto}
        </Alert>
      )}
      <Box component="form" sx={styles.formContainer} noValidate autoComplete="off">
        <Typography variant="h6" gutterBottom>Dados do Paciente</Typography>
        <TextField fullWidth label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="CPF" value={cpf} onChange={handleChangeCPF} margin="normal" variant="outlined" inputProps={{ maxLength: 14 }} />
        <TextField fullWidth label="RG" value={rg} onChange={(e) => setRg(e.target.value)} margin="normal" variant="outlined" />
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="sexo-biologico-label">Sexo Biológico</InputLabel>
          <Select
            labelId="sexo-biologico-label"
            value={sexoBiologico}
            onChange={(e) => setSexoBiologico(e.target.value)}
          >
            <MenuItem value="Masculino">Masculino</MenuItem>
            <MenuItem value="Feminino">Feminino</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="genero-label">Gênero</InputLabel>
          <Select
            labelId="genero-label"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
          >
            <MenuItem value="Masculino">Masculino</MenuItem>
            <MenuItem value="Feminino">Feminino</MenuItem>
            <MenuItem value="Não-binário">Não-binário</MenuItem>
            <MenuItem value="Transgênero">Transgênero</MenuItem>
            <MenuItem value="Outro">Outro</MenuItem>
          </Select>
        </FormControl>

        <TextField fullWidth label="Data de Nascimento" type="date" InputLabelProps={{ shrink: true }} value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} margin="normal" variant="outlined" />

        <TextField fullWidth label="CEP" value={cep} onBlur={() => buscarEnderecoPorCep(cep)} onChange={(e) => setCep(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} margin="normal" variant="outlined" disabled />
        <TextField fullWidth label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} margin="normal" variant="outlined" disabled />
        <TextField fullWidth label="Número da Residência" value={numeroResidencia} onChange={(e) => setNumeroResidencia(e.target.value)} margin="normal" variant="outlined" />

        <TextField fullWidth label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} margin="normal" variant="outlined" />

        <FormControlLabel
          control={<Checkbox checked={temProntuarioAntigo} onChange={(e) => setTemProntuarioAntigo(e.target.checked)} />}
          label="Possui prontuário antigo?"
        />
        
        {temProntuarioAntigo && (
          <>
            <TextField fullWidth label="Prontuário Antigo" value={prontuarioAntigo} onChange={(e) => setProntuarioAntigo(e.target.value)} margin="normal" variant="outlined" />
            <TextField fullWidth label="Localização do Prontuário Antigo" value={localizacaoProntuarioAntigo} onChange={(e) => setLocalizacaoProntuarioAntigo(e.target.value)} margin="normal" variant="outlined" />
          </>
        )}

        <Button fullWidth variant="contained" color="primary" onClick={cadastrarPaciente} sx={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </Box>
    </Container>
  );
};

export default CadastroPaciente;
