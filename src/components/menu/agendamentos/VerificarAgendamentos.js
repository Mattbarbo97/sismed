import React, { useState, useEffect } from 'react';
 // eslint-disable-next-line
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import MenuPrincipal from '../../menu/MenuPrincipal'; // Importar o menu principal
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
import { format, isValid, isAfter } from 'date-fns';
import './VerificarAgendamentos.css'; // Importar o CSS personalizado

const VerificarAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState('');
  const [diaSelecionado, setDiaSelecionado] = useState('');

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const medicosSnapshot = await getDocs(collection(db, 'usuarios_cadastrados'));
        const medicosList = medicosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        try {
          const querySnapshot = await getDocs(collection(db, 'agendamentos'));
          const agendamentosList = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const agendamentoData = data.data.toDate ? data.data.toDate() : data.data;
            if (data.ProfissionalId === medicoSelecionado && isAfter(new Date(agendamentoData), new Date())) {
              agendamentosList.push({ id: doc.id, ...data });
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

  const agruparAgendamentosPorData = (agendamentos) => {
    return agendamentos.reduce((grupo, agendamento) => {
      const data = agendamento.data.toDate ? agendamento.data.toDate() : agendamento.data;
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

  const agendamentosAgrupados = agruparAgendamentosPorData(agendamentos);

  const handleDiaClick = (dia) => {
    setDiaSelecionado(dia);
  };

  return (
    <Box className="container">
      <MenuPrincipal /> {/* Adicionar o menu principal */}
      <Box className="header-container">
        <Typography variant="h4" className="header">Verificar Agendamentos</Typography>
        <FormControl>
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

      <Box className="dia-container">
        {Object.keys(agendamentosAgrupados).map((data) => (
          <Box
            key={data}
            className={`dia-button ${diaSelecionado === data ? 'dia-selecionado' : ''}`}
            onClick={() => handleDiaClick(data)}
          >
            {isValid(new Date(data)) ? format(new Date(data), 'dd/MM/yyyy') : 'Data inválida'}
          </Box>
        ))}
      </Box>

      {diaSelecionado && (
        <Box className="agendamento-container">
          {isValid(new Date(diaSelecionado)) ? (
            <Typography variant="h6" align="center">{format(new Date(diaSelecionado), 'dd/MM/yyyy')}</Typography>
          ) : (
            <Typography variant="h6" className="invalid-date" align="center">Data inválida: {diaSelecionado}</Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {agendamentosAgrupados[diaSelecionado]?.map((agendamento) => (
              <Card key={agendamento.id} variant="outlined" className={`agendamento-card status-${agendamento.status || 'pendente'}`} sx={{ width: '80%', marginBottom: 1 }}>
                <CardContent className="card-content">
                  <Typography variant="subtitle1">{`Paciente: ${agendamento.pacienteNome || 'N/A'}`}</Typography>
                  <Typography variant="body2">{`Horário: ${agendamento.horario}`}</Typography>
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
                </CardActions>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VerificarAgendamentos;
