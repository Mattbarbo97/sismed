import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, MenuItem, FormControl, InputLabel, Select, Checkbox, FormControlLabel } from '@mui/material';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import axios from 'axios';
import MenuPrincipal from '../MenuPrincipal'; // Ajuste o caminho conforme necessário
import useStyles from './CadastroPacienteStyles';

const CadastroPaciente = ({ onSalvar }) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
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
  const [contatoEmergencia, setContatoEmergencia] = useState('');
  const [temProntuarioAntigo, setTemProntuarioAntigo] = useState(false);
  const [prontuarioAntigo, setProntuarioAntigo] = useState('');
  const [localizacaoProntuarioAntigo, setLocalizacaoProntuarioAntigo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = useStyles();

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
        console.error(error);
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
    setCpf(cpfFormatado);
  };

  const buscarPacientePorCPF = async (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove a formatação do CPF
    const q = query(collection(firestore, 'pacientes_cadastrados'), where('cpf', '==', cpfLimpo));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
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

    setIsSubmitting(true);

    if (nome && cpf && rg && sexoBiologico && genero && dataNascimento && endereco && bairro && cidade && estado && cep && numeroResidencia && email && telefone && contatoEmergencia) {
      try {
        const pacienteJaExiste = await buscarPacientePorCPF(cpf);
        if (pacienteJaExiste) {
          alert('Erro: Paciente com este CPF já está cadastrado.');
          setIsSubmitting(false);
          return;
        }

        const numeroProntuario = await buscarUltimoNumeroProntuario();
        const prontuarioFormatado = String(numeroProntuario).padStart(7, '0');

        const pacienteData = {
          nome,
          cpf: cpf.replace(/\D/g, ''), // Remove a formatação do CPF ao salvar
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
          contatoEmergencia,
          numeroProntuario: prontuarioFormatado
        };

        if (temProntuarioAntigo) {
          pacienteData.prontuarioAntigo = prontuarioAntigo;
          pacienteData.localizacaoProntuarioAntigo = localizacaoProntuarioAntigo;
        }

        const docRef = await addDoc(collection(firestore, 'pacientes_cadastrados'), pacienteData);
        const novoPaciente = { id: docRef.id, ...pacienteData };
        onSalvar(novoPaciente);  // Chama a função de callback passada do componente pai
        alert('Sucesso: Paciente cadastrado com sucesso!');
        
        // Limpa o formulário após o cadastro
        setNome('');
        setCpf('');
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
        setContatoEmergencia('');
        setTemProntuarioAntigo(false);
        setProntuarioAntigo('');
        setLocalizacaoProntuarioAntigo('');
      } catch (error) {
        console.error('Erro ao salvar no Firestore:', error);
        alert('Erro: Ocorreu um erro ao cadastrar o paciente.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert('Erro: Por favor, preencha todos os campos.');
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <MenuPrincipal />
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

        <Typography variant="h6" gutterBottom>Contato</Typography>
        <TextField fullWidth label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Contato de Emergência" value={contatoEmergencia} onChange={(e) => setContatoEmergencia(e.target.value)} margin="normal" variant="outlined" />

        <Typography variant="h6" gutterBottom>Endereço</Typography>
        <TextField fullWidth label="CEP" value={cep} onBlur={() => buscarEnderecoPorCep(cep)} onChange={(e) => setCep(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Endereço (Rua)" value={endereco} onChange={(e) => setEndereco(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} margin="normal" variant="outlined" />
        <TextField fullWidth label="Número da residência" value={numeroResidencia} onChange={(e) => setNumeroResidencia(e.target.value)} margin="normal" variant="outlined" />

        <FormControlLabel
          control={
            <Checkbox
              checked={temProntuarioAntigo}
              onChange={(e) => setTemProntuarioAntigo(e.target.checked)}
            />
          }
          label="Possui prontuário antigo?"
        />
        {temProntuarioAntigo && (
          <>
            <TextField fullWidth label="Número do Prontuário Antigo" value={prontuarioAntigo} onChange={(e) => setProntuarioAntigo(e.target.value)} margin="normal" variant="outlined" />
            <TextField fullWidth label="Localização do Prontuário Antigo" value={localizacaoProntuarioAntigo} onChange={(e) => setLocalizacaoProntuarioAntigo(e.target.value)} margin="normal" variant="outlined" />
          </>
        )}

        <Button fullWidth variant="contained" color="primary" onClick={cadastrarPaciente} sx={styles.submitButton} disabled={isSubmitting}>Cadastrar</Button>
      </Box>
    </Container>
  );
};

export default CadastroPaciente;
