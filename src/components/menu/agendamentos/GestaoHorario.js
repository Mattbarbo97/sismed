/* eslint-disable no-unused-vars, no-loop-func */
import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addDays from 'date-fns/addDays';
import addYears from 'date-fns/addYears';
import ptBR from 'date-fns/locale/pt-BR';
import MenuPrincipal from '../../menu/MenuPrincipal';
import './GestaoHorario.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
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
  1: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimentoNormal: '', duracaoRetorno: '', indisponiveis: [] },
  2: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimentoNormal: '', duracaoRetorno: '', indisponiveis: [] },
  3: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimentoNormal: '', duracaoRetorno: '', indisponiveis: [] },
  4: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimentoNormal: '', duracaoRetorno: '', indisponiveis: [] },
  5: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimentoNormal: '', duracaoRetorno: '', indisponiveis: [] },
  6: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimentoNormal: '', duracaoRetorno: '', indisponiveis: [] },
};

const GestaoHorario = () => {
  const [profissionais, setProfissionais] = useState([]);
  const [ProfissionalSelecionado, setProfissionalSelecionado] = useState('');
  const [horarios, setHorarios] = useState(initialHorarios);
  const [eventos, setEventos] = useState([]);
  const [frequencia, setFrequencia] = useState('semanal');

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

  const calcularQuantidadeAtendimentos = (horarioDia, tipoAtendimento) => {
    if (horarioDia && horarioDia.active && horarioDia.horaInicio && horarioDia.horaFim && horarioDia[tipoAtendimento]) {
      const [horaInicioH, horaInicioM] = horarioDia.horaInicio.split(':').map(Number);
      const [horaFimH, horaFimM] = horarioDia.horaFim.split(':').map(Number);
      const inicio = horaInicioH * 60 + horaInicioM;
      const fim = horaFimH * 60 + horaFimM;
      const duracao = parseInt(horarioDia[tipoAtendimento], 10);

      if (!isNaN(inicio) && !isNaN(fim) && !isNaN(duracao) && duracao > 0) {
        return Math.floor((fim - inicio) / duracao);
      }
    }
    return 0;
  };

  const adicionarIndisponivel = (dia, inicio, fim) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        indisponiveis: [...prev[dia].indisponiveis, { inicio, fim }],
      },
    }));
  };

  const removerIndisponivel = (dia, index) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        indisponiveis: prev[dia].indisponiveis.filter((_, i) => i !== index),
      },
    }));
  };

  const Indisponiveis = ({ dia }) => (
    <Box>
      <Typography variant="h6">Horários Indisponíveis</Typography>
      {horarios[dia]?.indisponiveis?.map((indisponivel, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography>{`${indisponivel.inicio} - ${indisponivel.fim}`}</Typography>
          <Button onClick={() => removerIndisponivel(dia, index)}>Remover</Button>
        </Box>
      ))}
      <Button onClick={() => adicionarIndisponivel(dia, '09:00', '10:00')}>Adicionar Indisponível</Button>
    </Box>
  );

  const gerarEventosParaDia = (horarioDia, dataAtual, profissionalNome, dia) => {
    const eventos = [];
    if (horarioDia && horarioDia.active && horarioDia.horaInicio && horarioDia.horaFim) {
      const [horaInicioH, horaInicioM] = horarioDia.horaInicio.split(':').map(Number);
      const [horaFimH, horaFimM] = horarioDia.horaFim.split(':').map(Number);

      if (!isNaN(horaInicioH) && !isNaN(horaInicioM) && !isNaN(horaFimH) && !isNaN(horaFimM)) {
        const eventoInicio = new Date(dataAtual);
        eventoInicio.setDate(eventoInicio.getDate() + (dia - getDay(eventoInicio)));
        eventoInicio.setHours(horaInicioH, horaInicioM, 0, 0);
        const eventoFim = new Date(eventoInicio);
        eventoFim.setHours(horaFimH, horaFimM, 0, 0);

        const quantidadeAtendimentosNormais = calcularQuantidadeAtendimentos(horarioDia, 'duracaoAtendimentoNormal');
        const quantidadeRetornos = calcularQuantidadeAtendimentos(horarioDia, 'duracaoRetorno');

        if (quantidadeAtendimentosNormais > 0) {
          eventos.push({
            title: `${profissionalNome} - ${quantidadeAtendimentosNormais} atendimentos normais`,
            start: eventoInicio,
            end: eventoFim,
          });
        }

        if (quantidadeRetornos > 0) {
          eventos.push({
            title: `${profissionalNome} - ${quantidadeRetornos} retornos`,
            start: eventoInicio,
            end: eventoFim,
          });
        }
      }
    }
    return eventos;
  };

  const gerarEventos = useCallback((horarios) => {
    const eventos = [];
    const dataInicial = new Date();
    const dataFinal = addYears(dataInicial, 1);
    const profissionalNome = profissionais.find(p => p.id === ProfissionalSelecionado)?.nome || '';

    let dataAtual = dataInicial;
    while (dataAtual <= dataFinal) {
      const currentData = new Date(dataAtual);
      Object.keys(horarios).forEach((dia) => {
        if (horarios[dia].active) {
          const novosEventos = gerarEventosParaDia(horarios[dia], currentData, profissionalNome, Number(dia));
          eventos.push(...novosEventos);
        }
      });
      dataAtual = addDays(dataAtual, frequencia === 'quinzenal' ? 14 : 1);
    }

    return eventos;
      // eslint-disable-next-line
  }, [profissionais, ProfissionalSelecionado, frequencia]);

  useEffect(() => {
    if (ProfissionalSelecionado && horarios) {
      const eventosGerados = gerarEventos(horarios);
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

  const CustomEvent = ({ event }) => (
    <span>{event.title}</span>
  );

  return (
    <Box className="container">
      <MenuPrincipal />
      <Typography variant="h4" className="header">Gestão de Horários</Typography>
      <Box className="content">
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
            <Box className="dropdown-container">
              <FormControl sx={{ marginBottom: 3 }}>
                <InputLabel id="frequencia-select-label">Frequência</InputLabel>
                <Select
                  labelId="frequencia-select-label"
                  value={frequencia}
                  onChange={(e) => setFrequencia(e.target.value)}
                  className="select-field"
                >
                  <MenuItem value="semanal">Semanal</MenuItem>
                  <MenuItem value="quinzenal">Quinzenal</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2} justifyContent="center">
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
                          <Grid item xs={12}>
                            <TextField
                              label="Duração do Atendimento Normal (minutos)"
                              type="number"
                              fullWidth
                              name="duracaoAtendimentoNormal"
                              value={horarios[dia.value]?.duracaoAtendimentoNormal || ''}
                              onChange={(e) => handleHorarioChange(dia.value, e)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Duração do Retorno (minutos)"
                              type="number"
                              fullWidth
                              name="duracaoRetorno"
                              value={horarios[dia.value]?.duracaoRetorno || ''}
                              onChange={(e) => handleHorarioChange(dia.value, e)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Indisponiveis dia={dia.value} />
                          </Grid>
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ marginTop: 3, textAlign: 'center' }}>
              <Button variant="contained" color="primary" onClick={handleSave}>Salvar Horários</Button>
            </Box>

            <Box sx={{ height: 500, marginTop: 5 }}>
              <Calendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                messages={{
                  next: "Próximo",
                  previous: "Anterior",
                  today: "Hoje",
                  month: "Mês",
                  week: "Semana",
                  day: "Dia",
                  agenda: "Agenda",
                  date: "Data",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "Não há eventos nesta faixa de datas.",
                  showMore: total => `+${total} mais`,
                }}
                components={{
                  event: CustomEvent,
                }}
                className="calendar"
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default GestaoHorario;
