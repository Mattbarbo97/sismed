/* eslint-disable no-unused-vars, no-loop-func */

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // Atualize o caminho conforme a estrutura do seu projeto
import MenuPrincipal from '../../menu/MenuPrincipal'; // Atualize o caminho conforme a estrutura do seu projeto
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';

const VerificarAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState('');
  const [diaSelecionado, setDiaSelecionado] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState('');

  useEffect(() => {
    const fetchMedicos = async () => {
      const medicosSnapshot = await getDocs(collection(db, 'usuarios_cadastrados'));
      const medicosList = medicosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedicos(medicosList);
    };

    fetchMedicos();
  }, []);

  useEffect(() => {
    const fetchPacientes = async () => {
      const pacientesSnapshot = await getDocs(collection(db, 'pacientes_cadastrados'));
      const pacientesList = pacientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPacientes(pacientesList);
    };

    fetchPacientes();
  }, []);

  useEffect(() => {
    if (medicoSelecionado) {
      const fetchAgendamentos = async () => {
        const querySnapshot = await getDocs(collection(db, 'agendamentos'));
        const agendamentosList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.atendenteId === medicoSelecionado) {
            const agendamentoData = data.data.toDate ? data.data.toDate() : new Date(data.data);
            agendamentosList.push({ id: doc.id, ...data, data: agendamentoData });
          }
        });
        setAgendamentos(agendamentosList);
      };

      fetchAgendamentos();
    }
  }, [medicoSelecionado]);

  const agruparAgendamentosPorData = (agendamentos) => {
    return agendamentos.reduce((grupo, agendamento) => {
      const data = agendamento.data;
      const formattedDate = format(data, 'yyyy-MM-dd');
      if (!grupo[formattedDate]) {
        grupo[formattedDate] = [];
      }
      grupo[formattedDate].push(agendamento);
      return grupo;
    }, {});
  };

  const atualizarStatusAgendamento = async (id, status) => {
    try {
      const docRef = doc(db, 'agendamentos', id);
      await updateDoc(docRef, { status });
      setAgendamentos(prevAgendamentos => prevAgendamentos.map(ag => ag.id === id ? { ...ag, status } : ag));
    } catch (error) {
      console.error('Erro ao atualizar agendamento: ', error);
    }
  };

  const adicionarAgendamento = async () => {
    try {
      const novoAgendamento = {
        atendenteId: medicoSelecionado,
        pacienteNome: novoPaciente,
        data: diaSelecionado,
        horario: 'Encaixe', // Defina o horário apropriado
        status: 'confirmado',
      };
      await addDoc(collection(db, 'agendamentos'), novoAgendamento);
      setDialogOpen(false);
      setNovoPaciente('');
      setDiaSelecionado('');
    } catch (error) {
      console.error('Erro ao adicionar agendamento: ', error);
    }
  };

  const agendamentosAgrupados = agruparAgendamentosPorData(agendamentos);

  const handleDiaClick = (data) => {
    setDiaSelecionado(data);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handlePacienteChange = (event, newValue) => {
    if (newValue) {
      setNovoPaciente(newValue.nome);
    } else {
      setNovoPaciente('');
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <MenuPrincipal /> {/* Adicionar o menu principal */}
      <Typography variant="h4" align="center" gutterBottom>
        Verificar Agendamentos
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <FormControl fullWidth margin="normal" sx={{ maxWidth: 300 }}>
          <InputLabel className="input-label">Selecionar Médico</InputLabel>
          <Select
            className="select-field"
            value={medicoSelecionado}
            label="Selecionar Médico"
            onChange={(e) => setMedicoSelecionado(e.target.value)}
          >
            {medicos.map((medico) => (
              <MenuItem key={medico.id} value={medico.id}>{medico.nome}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
        {Object.keys(agendamentosAgrupados).map((data) => (
          <IconButton key={data} onClick={() => handleDiaClick(data)}>
            <CalendarTodayIcon />
            <Typography variant="body2">
              {format(new Date(data), 'dd/MM/yyyy')}
            </Typography>
          </IconButton>
        ))}
      </Box>

      <Box>
        {diaSelecionado && (
          <Box>
            <Typography variant="h6" align="center">
              {format(new Date(diaSelecionado), 'dd/MM/yyyy')}
            </Typography>
            {agendamentosAgrupados[diaSelecionado].map((agendamento) => (
              <Card
                key={agendamento.id}
                variant="outlined"
                sx={{
                  marginBottom: 2,
                  boxShadow: 3,
                  backgroundColor: agendamento.status === 'confirmado' ? 'lightgreen' : agendamento.status === 'desmarcado' ? 'lightcoral' : 'white',
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1">{`Paciente: ${agendamento.pacienteNome}`}</Typography>
                  <Typography variant="body2">{`Horário: ${agendamento.horario}`}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => atualizarStatusAgendamento(agendamento.id, 'confirmado')}>Confirmar</Button>
                  <Button size="small" onClick={() => atualizarStatusAgendamento(agendamento.id, 'desmarcado')}>Desmarcar</Button>
                  <Button size="small" onClick={handleOpenDialog}>Adicionar Encaixe</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Adicionar Encaixe</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={pacientes}
            getOptionLabel={(option) => `${option.nome} (nasc.: ${format(new Date(option.dataNascimento), 'dd/MM/yyyy')})`}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Pesquisar Paciente" 
                fullWidth 
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      <IconButton onClick={handlePacienteChange}>
                        <SearchIcon />
                      </IconButton>
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  )
                }}
              />
            )}
            onChange={handlePacienteChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={adicionarAgendamento}>Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerificarAgendamentos;
