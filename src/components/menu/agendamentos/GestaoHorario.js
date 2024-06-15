import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line
import { getFirestore, doc, collection, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  FormControlLabel,
  Switch
} from '@mui/material'; // Corrigido aqui
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addDays from 'date-fns/addDays';
import addYears from 'date-fns/addYears';
import MenuPrincipal from '../../menu/MenuPrincipal'; // Importar o menu principal
import './GestaoHorario.css'; // Importar o CSS personalizado

const locales = {
  'pt-BR': require('date-fns/locale/pt-BR'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const diasDaSemana = [
  { label: 'Segunda-feira', value: 1 },
  { label: 'Terça-feira', value: 2 },
  { label: 'Quarta-feira', value: 3 },
  { label: 'Quinta-feira', value: 4 },
  { label: 'Sexta-feira', value: 5 },
  { label: 'Sábado', value: 6 },
];

const initialHorarios = {
  1: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '' },
  2: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '' },
  3: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '' },
  4: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '' },
  5: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '' },
  6: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '' },
};

const GestaoHorario = () => {
  const [profissionais, setProfissionais] = useState([]);
  const [ProfissionalSelecionado, setProfissionalSelecionado] = useState('');
  const [horarios, setHorarios] = useState(initialHorarios);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const fetchProfissionais = async () => {
      const querySnapshot = await getDocs(collection(db, 'usuarios_cadastrados'));
      const profissionaisList = [];
      querySnapshot.forEach((doc) => {
        profissionaisList.push({ id: doc.id, ...doc.data() });
      });
      setProfissionais(profissionaisList);
    };

    fetchProfissionais();
  }, []);

  useEffect(() => {
    const fetchDisponibilidade = async () => {
      if (ProfissionalSelecionado) {
        const docRef = doc(db, 'usuarios_cadastrados', ProfissionalSelecionado);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHorarios(data.disponibilidade?.horarios || initialHorarios);
        } else {
          setHorarios(initialHorarios);
        }
      }
    };

    fetchDisponibilidade();
  }, [ProfissionalSelecionado]);

  const gerarEventos = useCallback((horarios, profissionalSelecionado) => {
    const eventos = [];
    const dataInicial = new Date();
    const dataFinal = addYears(dataInicial, 1);

    let dataAtual = dataInicial;
    while (dataAtual <= dataFinal) {
      Object.keys(horarios).forEach((dia) => {
        const horarioDia = horarios[dia];
        if (horarioDia && horarioDia.active && horarioDia.horaInicio && horarioDia.horaFim) {
          const [horaInicioH, horaInicioM] = horarioDia.horaInicio.split(':').map(Number);
          const [horaFimH, horaFimM] = horarioDia.horaFim.split(':').map(Number);

          if (!isNaN(horaInicioH) && !isNaN(horaInicioM) && !isNaN(horaFimH) && !isNaN(horaFimM)) {
            const eventoInicio = new Date(dataAtual);
            eventoInicio.setDate(eventoInicio.getDate() + (dia - getDay(eventoInicio)));
            eventoInicio.setHours(horaInicioH, horaInicioM, 0, 0);
            const eventoFim = new Date(eventoInicio);
            eventoFim.setHours(horaFimH, horaFimM, 0, 0);
            eventos.push({
              title: `${profissionais.find(p => p.id === profissionalSelecionado).nome} - ${diasDaSemana.find(d => d.value === Number(dia)).label}`,
              start: eventoInicio,
              end: eventoFim,
            });
          }
        }
      });

      dataAtual = addDays(dataAtual, 1);
    }

    return eventos;
  }, [profissionais]);

  useEffect(() => {
    if (ProfissionalSelecionado && horarios) {
      const eventosGerados = gerarEventos(horarios, ProfissionalSelecionado);
      setEventos(eventosGerados);
    }
  }, [horarios, ProfissionalSelecionado, gerarEventos]);

  const handleSave = async () => {
    if (ProfissionalSelecionado) {
      const docRef = doc(db, 'usuarios_cadastrados', ProfissionalSelecionado);
      await updateDoc(docRef, { disponibilidade: { horarios } });
      alert('Horários atualizados com sucesso!');
    }
  };

  const handleHorarioChange = (dia, event) => {
    const { name, value } = event.target;
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [name]: value,
      },
    }));
  };

  const handleActiveChange = (dia) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        active: !prev[dia].active,
      },
    }));
  };

  return (
    <Box className="container">
      <MenuPrincipal /> {/* Adicionar o menu principal */}
      <Typography variant="h4" className="header">Gestão de Horários</Typography>
      <Box className="dropdown-container">
        <FormControl sx={{ marginBottom: 3 }}>
          <InputLabel id="Profissional-select-label">Selecione um Profissional</InputLabel>
          <Select
            labelId="Profissional-select-label"
            value={ProfissionalSelecionado}
            onChange={(e) => setProfissionalSelecionado(e.target.value)}
            className="select-field"
          >
            {profissionais.map((pro) => (
              <MenuItem key={pro.id} value={pro.id}>{pro.nome}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {ProfissionalSelecionado && (
        <>
          <Grid container spacing={2}>
            {diasDaSemana.map((dia) => (
              <Grid item xs={12} md={4} key={dia.value}>
                <Card className="horario-card">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{dia.label}</Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={horarios[dia.value].active}
                            onChange={() => handleActiveChange(dia.value)}
                            color="primary"
                          />
                        }
                        label="Ativar"
                      />
                    </Box>
                    {horarios[dia.value].active && (
                      <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        <Grid item xs={6}>
                          <TextField
                            label="Hora de Início"
                            type="time"
                            fullWidth
                            name="horaInicio"
                            value={horarios[dia.value]?.horaInicio || ''}
                            onChange={(e) => handleHorarioChange(dia.value, e)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Hora de Término"
                            type="time"
                            fullWidth
                            name="horaFim"
                            value={horarios[dia.value]?.horaFim || ''}
                            onChange={(e) => handleHorarioChange(dia.value, e)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Início do Almoço"
                            type="time"
                            fullWidth
                            name="inicioAlmoco"
                            value={horarios[dia.value]?.inicioAlmoco || ''}
                            onChange={(e) => handleHorarioChange(dia.value, e)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Fim do Almoço"
                            type="time"
                            fullWidth
                            name="fimAlmoco"
                            value={horarios[dia.value]?.fimAlmoco || ''}
                            onChange={(e) => handleHorarioChange(dia.value, e)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Duração do Atendimento (minutos)"
                            type="number"
                            fullWidth
                            name="duracaoAtendimento"
                            value={horarios[dia.value]?.duracaoAtendimento || ''}
                            onChange={(e) => handleHorarioChange(dia.value, e)}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ marginTop: 3 }}>
            <Button variant="contained" color="primary" onClick={handleSave}>Salvar Horários</Button>
          </Box>

          <Box sx={{ height: 500, marginTop: 5 }}>
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              className="calendar"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default GestaoHorario;
