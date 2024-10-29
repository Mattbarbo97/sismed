/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useNavigate } from 'react-router-dom';
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
  Button
} from '@mui/material';
import { format, isAfter } from 'date-fns';
import './VerificarAgendamentos.css';

const VerificarAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState('');
  const [pacientesMap, setPacientesMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const medicosSnapshot = await getDocs(collection(db, 'usuarios_cadastrados'));
        const medicosList = medicosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        medicosList.sort((a, b) => a.nome.localeCompare(b.nome));
        setMedicos(medicosList);
      } catch (error) {
        console.error('Erro ao buscar médicos: ', error);
      }
    };
    fetchMedicos();
  }, []);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const pacientesSnapshot = await getDocs(collection(db, 'pacientes_cadastrados'));
        const pacientes = {};
        pacientesSnapshot.forEach((doc) => {
          const data = doc.data();
          pacientes[data.nome] = data; // Adiciona o paciente ao JSON com o nome como chave
        });
        setPacientesMap(pacientes); // Armazena o JSON de pacientes
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
      }
    };
    fetchPacientes();
  }, []);

  const fetchPacienteProntuario = (pacienteNome) => {
    const paciente = pacientesMap[pacienteNome];
    return paciente ? paciente.numeroProntuario : 'N/A';
  };

  const fetchAgendamentos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'agendamentos'));
      const agendamentosList = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data && data.data) {
          const dataAgendamento = data.data.seconds ? new Date(data.data.seconds * 1000) : data.data;
          if (data.profissionalId === medicoSelecionado) {
            const numeroProntuario = fetchPacienteProntuario(data.pacienteNome);
            agendamentosList.push({ id: doc.id, ...data, data: dataAgendamento, numeroProntuario });
          }
        }
      }
      setAgendamentos(agendamentosList);
    } catch (error) {
      console.error('Erro ao buscar agendamentos: ', error);
    }
  };

  useEffect(() => {
    if (medicoSelecionado) {
      fetchAgendamentos();
    }
  }, [medicoSelecionado]);

const irParaProntuario = () => {
  navigate('/criar-prontuario');
};


  const atualizarStatusAgendamento = async (id, status) => {
    try {
      const docRef = doc(db, 'agendamentos', id);
      await updateDoc(docRef, { status });
      setAgendamentos(prevAgendamentos =>
        prevAgendamentos.map(ag => (ag.id === id ? { ...ag, status } : ag))
      );
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
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
        return 'yellow';
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
            agendamentos.map((agendamento) => (
              <Card key={agendamento.id} variant="outlined" className="agendamento-card" style={{ backgroundColor: getStatusColor(agendamento.status || 'pendente') }}>
                <CardContent className="card-content">
                  <Typography variant="subtitle1">Paciente: {agendamento.pacienteNome || 'N/A'}</Typography>
                  <Typography variant="body2">Horário: {format(new Date(agendamento.data), 'HH:mm')}</Typography>
                  <Typography variant="body2">Nº Prontuário: {agendamento.numeroProntuario || 'N/A'}</Typography>
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
                    className="button-chegou"
                    onClick={() => atualizarStatusAgendamento(agendamento.id, 'chegou')}
                  >
                    Chegou
                  </Button>
                  <Button
                    size="small"
                    className="button-prontuario"
                   onClick={() => irParaProntuario()}
                  >
                  Ver Prontuário
                 </Button>

                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="h6" className="nenhum-agendamento">Nenhum agendamento encontrado para o médico selecionado.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default VerificarAgendamentos;
