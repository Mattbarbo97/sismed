import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useNavigate } from 'react-router-dom';
import MenuPrincipal from '../../menu/MenuPrincipal';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Select,
  MenuItem
} from '@mui/material';
import { format } from 'date-fns';
import './VerificarAgendamentos.css';

const VerificarAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState('');
  const [pacientesMap, setPacientesMap] = useState({});
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
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
          pacientes[data.nome] = data;
        });
        setPacientesMap(pacientes);
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
            // Use the horario field for the appointment time display
            agendamentosList.push({
              id: doc.id,
              ...data,
              data: dataAgendamento,
              numeroProntuario,
              horario: data.horario // Added to capture the horario field
            });
          }
        }
      }
      // Sort appointments from the earliest to the latest
      agendamentosList.sort((a, b) => a.data - b.data);
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

  const organizarAgendamentos = () => {
    const grouped = {};
    agendamentos.forEach(agendamento => {
      const year = format(agendamento.data, 'yyyy');
      const month = format(agendamento.data, 'MMMM');
      const day = format(agendamento.data, 'dd/MM/yyyy');

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = {};
      if (!grouped[year][month][day]) grouped[year][month][day] = [];

      grouped[year][month][day].push(agendamento);
    });
    return grouped;
  };

  const groupedAgendamentos = organizarAgendamentos();

  const irParaProntuario = () => {
    navigate('/criar-prontuario');
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

  const updateAppointmentStatus = (id, newStatus) => {
    setAgendamentos(prevAgendamentos => 
      prevAgendamentos.map(agendamento => 
        agendamento.id === id ? { ...agendamento, status: newStatus } : agendamento
      )
    );
  };

  return (
    <Box className="container">
      <MenuPrincipal />
      <Box className="header-container">
        <Typography variant="h4" className="header">Verificar Agendamentos</Typography>
      </Box>

      <Box className="main-content">
        {/* Dropdown para selecionar o médico */}
        <Box className="medico-select">
          <Typography variant="h6">Selecione o Médico:</Typography>
          <Select
            value={medicoSelecionado}
            onChange={(e) => setMedicoSelecionado(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>Selecione um médico</em>
            </MenuItem>
            {medicos.map((medico) => (
              <MenuItem key={medico.id} value={medico.id}>{medico.nome}</MenuItem>
            ))}
          </Select>
        </Box>

        <Box className="year-list">
          {Object.keys(groupedAgendamentos).map(year => (
            <Button key={year} onClick={() => setSelectedYear(year)}>{year}</Button>
          ))}
        </Box>

        {selectedYear && (
          <Box className="month-list" style={{ display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
            {Object.keys(groupedAgendamentos[selectedYear]).map(month => (
              <Button key={month} onClick={() => setSelectedMonth(month)}>{month}</Button>
            ))}
          </Box>
        )}

        {selectedYear && selectedMonth && (
          <Box className="day-list">
            {Object.keys(groupedAgendamentos[selectedYear][selectedMonth]).map(day => (
              <Button key={day} onClick={() => setSelectedDay(day)}>{day}</Button>
            ))}
          </Box>
        )}

        {selectedYear && selectedMonth && selectedDay && (
          <Box className="appointment-list">
            <Typography variant="h6">{`${selectedDay} - ${selectedMonth} - ${selectedYear}`}</Typography>
            {(groupedAgendamentos[selectedYear]?.[selectedMonth]?.[selectedDay] || []).map((agendamento) => (
              <Card
                key={agendamento.id}
                variant="outlined"
                className="agendamento-card"
                style={{
                  backgroundColor: getStatusColor(agendamento.status || 'pendente'),
                  minWidth: '300px',
                  margin: '16px',
                }}
              >
                <CardContent className="card-content">
                  <Typography variant="subtitle1">Paciente: {agendamento.pacienteNome || 'N/A'}</Typography>
                  <Typography variant="body2">Horário: {agendamento.horario || 'N/A'}</Typography>
                  <Typography variant="body2">Nº Prontuário: {agendamento.numeroProntuario || 'N/A'}</Typography>
                </CardContent>
                <CardActions className="card-actions">
                  <Button size="small" onClick={() => irParaProntuario()}>Ver Prontuário</Button>
                  <Button size="small" onClick={() => updateAppointmentStatus(agendamento.id, 'confirmado')}>Confirmar</Button>
                  <Button size="small" onClick={() => updateAppointmentStatus(agendamento.id, 'desmarcado')}>Desmarcar</Button>
                  <Button size="small" onClick={() => updateAppointmentStatus(agendamento.id, 'encaixado')}>Encaixar</Button>
                  <Button size="small" onClick={() => updateAppointmentStatus(agendamento.id, 'chegou')}>Chegou</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VerificarAgendamentos;
