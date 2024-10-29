/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import MenuPrincipal from '../../menu/MenuPrincipal';
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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete
} from '@mui/material';
import { format, isValid, isAfter, parseISO } from 'date-fns';
import './VerificarAgendamentos.css';

const VerificarAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState('');
  const [diaSelecionado, setDiaSelecionado] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [pacienteNome, setPacienteNome] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const medicosSnapshot = await getDocs(collection(db, 'usuarios_cadastrados'));
        const medicosList = medicosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ordena os médicos em ordem alfabética
        medicosList.sort((a, b) => a.nome.localeCompare(b.nome));

        setMedicos(medicosList);
      } catch (error) {
        console.error('Erro ao buscar médicos: ', error);
      }
    };

    fetchMedicos();
  }, []);

  useEffect(() => {
    if (medicoSelecionado) {
      const fetchAgendamentos = async () => {
        console.log('Buscando agendamentos para o médico selecionado:', medicoSelecionado);
        try {
          const querySnapshot = await getDocs(collection(db, 'agendamentos'));
          const agendamentosList = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data.data) {
              const dataAgendamento = data.data.seconds ? new Date(data.data.seconds * 1000) : data.data;
              if (data.profissionalId === medicoSelecionado && isAfter(new Date(dataAgendamento), new Date())) {
                agendamentosList.push({ id: doc.id, ...data, data: dataAgendamento });
              }
            }
          });
          setAgendamentos(agendamentosList);
        } catch (error) {
          console.error('Erro ao buscar agendamentos: ', error);
        }
      };

      fetchAgendamentos();
    }
  }, [medicoSelecionado]);

  const agruparAgendamentosPorMes = (agendamentos) => {
    return agendamentos.reduce((grupo, agendamento) => {
      const data = agendamento.data;
      if (!isValid(new Date(data))) {
        console.error('Data inválida:', data);
        return grupo;
      }
      const formattedMonth = format(new Date(data), 'yyyy-MM');
      if (!grupo[formattedMonth]) {
        grupo[formattedMonth] = [];
      }
      grupo[formattedMonth].push(agendamento);
      return grupo;
    }, {});
  };

  const agruparAgendamentosPorData = (agendamentos) => {
    return agendamentos.reduce((grupo, agendamento) => {
      const data = agendamento.data;
      if (!isValid(new Date(data))) {
        console.error('Data inválida:', data);
        return grupo;
      }
      const formattedDate = format(new Date(data), 'yyyy-MM-dd');
      if (!grupo[formattedDate]) {
        grupo[formattedDate] = [];
      }
      grupo[formattedDate].push(agendamento);
      return grupo;
    }, {});
  };

  const agendamentosAgrupadosPorMes = agruparAgendamentosPorMes(agendamentos);

  const atualizarStatusAgendamento = async (id, status) => {
    try {
      const docRef = doc(db, 'agendamentos', id);
      await updateDoc(docRef, { status });
      setAgendamentos(prevAgendamentos => {
        return prevAgendamentos.map(ag => (ag.id === id ? { ...ag, status } : ag));
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    }
  };

  const buscarPacientes = async (nome) => {
    if (!nome) return;
    const pacientesSnapshot = await getDocs(query(collection(db, 'pacientes_cadastrados'), where('nome', '>=', nome), where('nome', '<=', nome + '\uf8ff')));
    const pacientesList = pacientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPacientes(pacientesList);
  };

  const handleEncaixarPaciente = () => {
    setOpenDialog(true);
  };

  const handleConfirmarEncaixe = async () => {
    if (selectedPaciente && medicoSelecionado) {
      try {
        const agendamentoOriginal = agendamentos.find(ag => ag.data.getTime() === new Date(diaSelecionado).getTime() && ag.profissionalId === medicoSelecionado);
        if (agendamentoOriginal) {
          const novoAgendamento = {
            profissionalId: medicoSelecionado,
            pacienteNome: selectedPaciente.nome,
            horario: agendamentoOriginal.horario,
            status: 'encaixado',
            data: agendamentoOriginal.data
          };
          await addDoc(collection(db, 'agendamentos'), novoAgendamento);
          setAgendamentos([...agendamentos, novoAgendamento]);
          setOpenDialog(false);
          setPacienteNome('');
          setPacientes([]);
        }
      } catch (error) {
        console.error('Erro ao encaixar paciente:', error);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      buscarPacientes(pacienteNome);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
        return 'lightgreen';
      case 'desmarcado':
        return 'lightcoral';
      case 'pendente':
        return 'lightgoldenrodyellow';
      case 'encaixado':
        return 'lightblue';
      case 'chegou':
        return 'yellow'; // Cor amarelo forte para o status "chegou"
      default:
        return 'white';
    }
  };

  return (
    <Box className="container">
      <MenuPrincipal />
      <Box className="header-container">
        <Typography variant="h4" className="header">Verificar Agendamentos</Typography>
        <FormControl className="select-container">
          <InputLabel>Selecionar Médico</InputLabel>
          <Select
            value={medicoSelecionado}
            onChange={(e) => setMedicoSelecionado(e.target.value)}
            className="select-field"
          >
            {medicos.map((medico) => (
              <MenuItem key={medico.id} value={medico.id}>{medico.nome}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {medicoSelecionado && (
        <Box className="agendamentos-list-container">
          {agendamentos.length > 0 ? (
            Object.keys(agendamentosAgrupadosPorMes).map((mes) => (
              <Box key={mes} className="agendamentos-mes">
                <Typography variant="h5" className="agendamentos-mes-titulo">
                  {format(parseISO(`${mes}-01`), 'MMMM yyyy')}
                </Typography>
                {Object.keys(agruparAgendamentosPorData(agendamentosAgrupadosPorMes[mes])).map((data) => (
                  <Box key={data} className="agendamentos-dia">
                    <Typography variant="h6" className="agendamentos-dia-titulo">
                      {format(new Date(data), 'dd/MM/yyyy')}
                    </Typography>
                    {agruparAgendamentosPorData(agendamentosAgrupadosPorMes[mes])[data].map((agendamento) => (
                      <Card key={agendamento.id} variant="outlined" className="agendamento-card" style={{ backgroundColor: getStatusColor(agendamento.status || 'pendente') }}>
                        <CardContent className="card-content">
                          <Typography variant="subtitle1">{`Paciente: ${agendamento.pacienteNome || 'N/A'}`}</Typography>
                          <Typography variant="body2">
                            {`Horário: ${
                              typeof agendamento.horario === 'string'
                                ? agendamento.horario
                                : agendamento.horario?.seconds
                                ? format(new Date(agendamento.horario.seconds * 1000), 'HH:mm')
                                : 'N/A'
                            }`}
                          </Typography>
                        </CardContent>
                        <CardActions className="card-actions">
                          <Button
                            size="small"
                            className="button-confirmar"
                            onClick={() => atualizarStatusAgendamento(agendamento.id, 'confirmado')}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="small"
                            className="button-desmarcar"
                            onClick={() => atualizarStatusAgendamento(agendamento.id, 'desmarcado')}
                          >
                            Desmarcar
                          </Button>
                          <Button
                            size="small"
                            className="button-encaixar"
                            onClick={handleEncaixarPaciente}
                          >
                            Encaixar
                          </Button>
                          <Button
                            size="small"
                            className="button-chegou"
                            onClick={() => atualizarStatusAgendamento(agendamento.id, 'chegou')}
                          >
                            Chegou
                          </Button>
                        </CardActions>
                      </Card>
                    ))}
                  </Box>
                ))}
              </Box>
            ))
          ) : (
            <Typography variant="h6" className="nenhum-agendamento">Nenhum agendamento encontrado para o médico selecionado.</Typography>
          )}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} sx={{ '& .MuiDialog-paper': { width: '35vw', height: '35vh' } }}>
        <DialogTitle>Encaixar Paciente</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={pacientes}
            getOptionLabel={(option) => option.nome}
            onInputChange={(event, newInputValue) => {
              setPacienteNome(newInputValue);
              buscarPacientes(newInputValue);
            }}
            onChange={(event, newValue) => {
              setSelectedPaciente(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nome do Paciente"
                variant="outlined"
                fullWidth
                margin="dense"
                onKeyPress={handleKeyPress}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">Cancelar</Button>
          <Button onClick={handleConfirmarEncaixe} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Box className="legenda-container">
        <Typography variant="h6">Legenda:</Typography>
        <Box className="legenda">
          <Box className="legenda-item">
            <Box className="legenda-cor" style={{ backgroundColor: 'lightgreen' }} />
            <Typography>Confirmado</Typography>
          </Box>
          <Box className="legenda-item">
            <Box className="legenda-cor" style={{ backgroundColor: 'yellow' }} />
            <Typography>Aguardando atendimento</Typography>
          </Box>
          <Box className="legenda-item">
            <Box className="legenda-cor" style={{ backgroundColor: 'lightcoral' }} />
            <Typography>Desmarcado</Typography>
          </Box>
          <Box className="legenda-item">
            <Box className="legenda-cor" style={{ backgroundColor: 'lightgoldenrodyellow' }} />
            <Typography>Pendente</Typography>
          </Box>
          <Box className="legenda-item">
            <Box className="legenda-cor" style={{ backgroundColor: 'lightblue' }} />
            <Typography>Encaixado</Typography> 
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
  
export default VerificarAgendamentos;
