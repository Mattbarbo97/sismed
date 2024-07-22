import React, { useState, useEffect } from 'react';
import { getFirestore, doc, collection, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Autocomplete,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addDays from 'date-fns/addDays';
import addWeeks from 'date-fns/addWeeks';
import addMonths from 'date-fns/addMonths';
import addYears from 'date-fns/addYears';
import ptBR from 'date-fns/locale/pt-BR';
import MenuPrincipal from '../../menu/MenuPrincipal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './GestaoHorario.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
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
  { label: 'Domingo', value: 0 },
];

const initialHorarios = {
  1: { active: false, dailySchedules: [] },
  2: { active: false, dailySchedules: [] },
  3: { active: false, dailySchedules: [] },
  4: { active: false, dailySchedules: [] },
  5: { active: false, dailySchedules: [] },
  6: { active: false, dailySchedules: [] },
  0: { active: false, dailySchedules: [] },
};

const messages = {
  allDay: 'Dia todo',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total) => `+${total} mais`,
};

const GestaoHorario = () => {
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('');
  const [horarios, setHorarios] = useState(initialHorarios);
  const [eventos, setEventos] = useState([]);
  const [isMapaCardiaco, setIsMapaCardiaco] = useState(false);
  const [dataInicio, setDataInicio] = useState(new Date());
  const [frequencia, setFrequencia] = useState('semanal');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [novoHorario, setNovoHorario] = useState({
    horaInicio: '',
    horaFim: '',
    inicioAlmoco: '',
    fimAlmoco: '',
    duracaoAtendimento: ''
  });

  useEffect(() => {
    const fetchProfissionais = async () => {
      const querySnapshot = await getDocs(collection(db, 'usuarios_cadastrados'));
      const profissionaisList = [];
      querySnapshot.forEach((doc) => {
        profissionaisList.push({ id: doc.id, ...doc.data() });
      });
      profissionaisList.sort((a, b) => a.nome.localeCompare(b.nome));
      console.log('Profissionais carregados:', profissionaisList);
      setProfissionais(profissionaisList);
    };

    fetchProfissionais();
  }, []);

  useEffect(() => {
    const fetchDisponibilidade = async () => {
      if (profissionalSelecionado) {
        if (profissionalSelecionado === 'Mapa Cardíaco') {
          setIsMapaCardiaco(true);
          setHorarios(gerarHorariosMapaCardiaco());
        } else {
          setIsMapaCardiaco(false);
          const docRef = doc(db, 'usuarios_cadastrados', profissionalSelecionado);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const disponibilidade = data.disponibilidade || { horarios: initialHorarios, frequencia: 'semanal', dataInicio: new Date() };
            const horariosCompletos = { ...initialHorarios, ...disponibilidade.horarios };
            for (const dia in horariosCompletos) {
              if (!horariosCompletos[dia].dailySchedules) {
                horariosCompletos[dia].dailySchedules = [];
              }
            }
            setHorarios(horariosCompletos);
            setFrequencia(disponibilidade.frequencia);
            setDataInicio(disponibilidade.dataInicio.toDate());
            console.log('Horários carregados para o profissional:', disponibilidade.horarios);
          } else {
            setHorarios(initialHorarios);
          }
        }
      }
    };

    fetchDisponibilidade();
  }, [profissionalSelecionado]);

  useEffect(() => {
    if (profissionalSelecionado) {
      const eventosGerados = gerarEventos();
      setEventos(eventosGerados);
      console.log('Eventos gerados:', eventosGerados);
    }
  }, [horarios, frequencia, dataInicio]);

  const gerarHorariosMapaCardiaco = () => {
    const horarios = { ...initialHorarios };
    const dias = [1, 2, 3, 4, 5]; // Segunda a Sexta

    dias.forEach(dia => {
      if (dia === 5) {
        // Sexta-feira
        horarios[dia] = { active: true, dailySchedules: [{ horaInicio: '08:00', horaFim: '11:00', duracaoAtendimento: 1500 }] }; // 25 horas em minutos
      } else {
        horarios[dia] = { active: true, dailySchedules: [{ horaInicio: '08:00', horaFim: '19:00', duracaoAtendimento: 1500 }] }; // 25 horas em minutos
      }
    });

    return horarios;
  };

  const handleSave = async () => {
    if (profissionalSelecionado && !isMapaCardiaco) {
      const docRef = doc(db, 'usuarios_cadastrados', profissionalSelecionado);
      await updateDoc(docRef, {
        disponibilidade: {
          horarios,
          frequencia,
          dataInicio
        }
      });
      alert('Horários atualizados com sucesso!');
    }
  };

  const handleHorarioChange = (e, dia, index) => {
    const { name, value } = e.target;
    setHorarios((prev) => {
      const updatedSchedules = [...prev[dia].dailySchedules];
      updatedSchedules[index] = {
        ...updatedSchedules[index],
        [name]: value,
      };
      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          dailySchedules: updatedSchedules,
        },
      };
    });
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

  const gerarEventos = () => {
    const eventos = [];
    let dataAtual = new Date(dataInicio);
    const dataFinal = addYears(dataAtual, 1);

    console.log(`Iniciando a geração de eventos a partir de: ${dataInicio}`);
    console.log(`Frequência selecionada: ${frequencia}`);

    while (dataAtual <= dataFinal) {
      const dataIteracao = new Date(dataAtual); // Evitar referência à variável no loop
      console.log(`Processando data: ${dataIteracao}`);

      Object.keys(horarios).forEach((dia) => {
        const horarioDia = horarios[dia];
        if (horarioDia && horarioDia.active && horarioDia.dailySchedules.length > 0) {
          horarioDia.dailySchedules.forEach(schedule => {
            if (schedule.horaInicio && schedule.horaFim) {
              const [horaInicioH, horaInicioM] = schedule.horaInicio.split(':').map(Number);
              const [horaFimH, horaFimM] = schedule.horaFim.split(':').map(Number);

              if (!isNaN(horaInicioH) && !isNaN(horaInicioM) && !isNaN(horaFimH) && !isNaN(horaFimM)) {
                const eventoInicio = new Date(dataIteracao);
                eventoInicio.setDate(eventoInicio.getDate() + ((dia - getDay(eventoInicio) + 7) % 7));
                eventoInicio.setHours(horaInicioH, horaInicioM, 0, 0);
                const eventoFim = new Date(eventoInicio);
                eventoFim.setHours(horaFimH, horaFimM, 0, 0);

                eventos.push({
                  title: `${profissionais.find(p => p.id === profissionalSelecionado).nome} - ${diasDaSemana.find(d => d.value === Number(dia)).label}`,
                  start: eventoInicio,
                  end: eventoFim,
                });
                console.log(`Evento adicionado: ${eventoInicio} - ${eventoFim}`);
              }
            }
          });
        }
      });

      // Incrementar dataAtual de acordo com a frequência
      if (frequencia === 'semanal') {
        dataAtual = addWeeks(dataAtual, 1);
      } else if (frequencia === 'quinzenal') {
        dataAtual = addWeeks(dataAtual, 2);
      } else if (frequencia === 'mensal') {
        dataAtual = addMonths(dataAtual, 1);
      } else {
        dataAtual = addDays(dataAtual, 1); // Frequência personalizada
      }
    }

    return eventos;
  };

  const handleDateChange = (date) => {
    setDataInicio(date);
  };

  const handleDialogOpen = (date) => {
    setSelectedDate(date);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDate(null);
    setNovoHorario({
      horaInicio: '',
      horaFim: '',
      inicioAlmoco: '',
      fimAlmoco: '',
      duracaoAtendimento: ''
    });
  };

  const handleNovoHorarioChange = (e) => {
    const { name, value } = e.target;
    setNovoHorario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDialogSave = () => {
    if (selectedDate) {
      const diaSemana = getDay(selectedDate);
      setHorarios((prev) => {
        const updatedSchedules = [
          ...prev[diaSemana].dailySchedules,
          { ...novoHorario }
        ];
        return {
          ...prev,
          [diaSemana]: {
            ...prev[diaSemana],
            dailySchedules: updatedSchedules,
          },
        };
      });
      handleDialogClose();
    }
  };

  return (
    <Box className="container">
      <MenuPrincipal /> {/* Adicionar o menu principal */}
      <Typography variant="h4" className="header">Gestão de Horários</Typography>
      <Box className="dropdown-container">
        <Autocomplete
          options={profissionais}
          getOptionLabel={(option) => option.nome}
          onChange={(event, newValue) => {
            if (newValue) {
              setProfissionalSelecionado(newValue.id);
            } else {
              setProfissionalSelecionado('');
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Pesquisar Profissional"
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
          sx={{ width: '300px', marginBottom: 3 }}
        />
      </Box>
      <Box className="dropdown-container">
        <FormControl sx={{ width: '300px', marginBottom: 3 }}>
          <InputLabel>Frequência</InputLabel>
          <Select
            value={frequencia}
            onChange={(e) => setFrequencia(e.target.value)}
          >
            <MenuItem value="semanal">Semanal</MenuItem>
            <MenuItem value="quinzenal">Quinzenal</MenuItem>
            <MenuItem value="mensal">Mensal</MenuItem>
            <MenuItem value="personalizado">Personalizado</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box className="dropdown-container">
        <TextField
          label="Data de Início da Frequência"
          type="date"
          value={format(dataInicio, 'yyyy-MM-dd')}
          onChange={(e) => handleDateChange(parse(e.target.value, 'yyyy-MM-dd', new Date()))}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ width: '300px', marginBottom: 3 }}
        />
      </Box>

      {profissionalSelecionado && (
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
                            checked={horarios[dia.value]?.active || false}
                            onChange={() => handleActiveChange(dia.value)}
                            color="primary"
                          />
                        }
                        label="Ativar"
                      />
                    </Box>
                    {horarios[dia.value]?.active && (
                      <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        {horarios[dia.value]?.dailySchedules.map((schedule, index) => (
                          <React.Fragment key={index}>
                            <Grid item xs={6}>
                              <TextField
                                label="Hora de Início"
                                type="time"
                                fullWidth
                                name="horaInicio"
                                value={schedule.horaInicio || ''}
                                onChange={(e) => handleHorarioChange(e, dia.value, index)}
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
                                value={schedule.horaFim || ''}
                                onChange={(e) => handleHorarioChange(e, dia.value, index)}
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
                                value={schedule.inicioAlmoco || ''}
                                onChange={(e) => handleHorarioChange(e, dia.value, index)}
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
                                value={schedule.fimAlmoco || ''}
                                onChange={(e) => handleHorarioChange(e, dia.value, index)}
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
                                value={schedule.duracaoAtendimento || ''}
                                onChange={(e) => handleHorarioChange(e, dia.value, index)}
                              />
                            </Grid>
                          </React.Fragment>
                        ))}
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
              messages={messages}
              onSelectSlot={(slotInfo) => handleDialogOpen(slotInfo.start)}
              selectable
            />
          </Box>

          <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogTitle>Adicionar Horário</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Hora de Início"
                type="time"
                fullWidth
                name="horaInicio"
                value={novoHorario.horaInicio}
                onChange={handleNovoHorarioChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                margin="dense"
                label="Hora de Término"
                type="time"
                fullWidth
                name="horaFim"
                value={novoHorario.horaFim}
                onChange={handleNovoHorarioChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                margin="dense"
                label="Início do Almoço"
                type="time"
                fullWidth
                name="inicioAlmoco"
                value={novoHorario.inicioAlmoco}
                onChange={handleNovoHorarioChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                margin="dense"
                label="Fim do Almoço"
                type="time"
                fullWidth
                name="fimAlmoco"
                value={novoHorario.fimAlmoco}
                onChange={handleNovoHorarioChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                margin="dense"
                label="Duração do Atendimento (minutos)"
                type="number"
                fullWidth
                name="duracaoAtendimento"
                value={novoHorario.duracaoAtendimento}
                onChange={handleNovoHorarioChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancelar</Button>
              <Button onClick={handleDialogSave}>Adicionar</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default GestaoHorario;
