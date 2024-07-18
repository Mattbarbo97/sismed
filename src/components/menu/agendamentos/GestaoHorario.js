import React, { useState, useEffect, useCallback } from 'react';
import { doc, collection, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  FormControlLabel,
  Switch,
  Autocomplete,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Modal,
  Fade,
  Backdrop
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
  1: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '', duracaoRetorno: '' },
  2: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '', duracaoRetorno: '' },
  3: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '', duracaoRetorno: '' },
  4: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '', duracaoRetorno: '' },
  5: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '', duracaoRetorno: '' },
  6: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '', duracaoRetorno: '' },
  0: { active: false, horaInicio: '', horaFim: '', inicioAlmoco: '', fimAlmoco: '', duracaoAtendimento: '', duracaoRetorno: '' },
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
  const [ProfissionalSelecionado, setProfissionalSelecionado] = useState('');
  const [horarios, setHorarios] = useState(initialHorarios);
  const [eventos, setEventos] = useState([]);
  const [isMapaCardiaco, setIsMapaCardiaco] = useState(false);
  const [dataInicio, setDataInicio] = useState(new Date());
  const [frequencia, setFrequencia] = useState('semanal');
  const [openModal, setOpenModal] = useState(false);
  const [selectedDia, setSelectedDia] = useState(null);

  const gerarHorariosMapaCardiaco = () => {
    const horarios = { ...initialHorarios };
    const dias = [1, 2, 3, 4, 5]; // Segunda a Sexta

    dias.forEach(dia => {
      if (dia === 5) {
        // Sexta-feira
        horarios[dia] = { active: true, horaInicio: '08:00', horaFim: '11:00', duracaoAtendimento: 1500, duracaoRetorno: 1500 }; // 25 horas em minutos
      } else {
        horarios[dia] = { active: true, horaInicio: '08:00', horaFim: '19:00', duracaoAtendimento: 1500, duracaoRetorno: 1500 }; // 25 horas em minutos
      }
    });

    return horarios;
  };

  const gerarEventos = useCallback(() => {
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
        if (horarioDia && horarioDia.active && horarioDia.horaInicio && horarioDia.horaFim) {
          const [horaInicioH, horaInicioM] = horarioDia.horaInicio.split(':').map(Number);
          const [horaFimH, horaFimM] = horarioDia.horaFim.split(':').map(Number);

          if (!isNaN(horaInicioH) && !isNaN(horaInicioM) && !isNaN(horaFimH) && !isNaN(horaFimM)) {
            const eventoInicio = new Date(dataIteracao);
            eventoInicio.setDate(eventoInicio.getDate() + ((dia - getDay(eventoInicio) + 7) % 7));
            eventoInicio.setHours(horaInicioH, horaInicioM, 0, 0);
            const eventoFim = new Date(eventoInicio);
            eventoFim.setHours(horaFimH, horaFimM, 0, 0);

            eventos.push({
              title: `${profissionais.find(p => p.id === ProfissionalSelecionado).nome} - ${diasDaSemana.find(d => d.value === Number(dia)).label} - Atendimento`,
              start: eventoInicio,
              end: eventoFim,
            });

            if (horarioDia.duracaoRetorno) {
              const eventoRetornoInicio = new Date(eventoInicio);
              eventoRetornoInicio.setHours(horaInicioH, horaInicioM + horarioDia.duracaoRetorno, 0, 0);
              const eventoRetornoFim = new Date(eventoRetornoInicio);
              eventoRetornoFim.setHours(horaFimH, horaFimM + horarioDia.duracaoRetorno, 0, 0);

              eventos.push({
                title: `${profissionais.find(p => p.id === ProfissionalSelecionado).nome} - ${diasDaSemana.find(d => d.value === Number(dia)).label} - Retorno`,
                start: eventoRetornoInicio,
                end: eventoRetornoFim,
              });
            }

            console.log(`Evento adicionado: ${eventoInicio} - ${eventoFim}`);
          }
        }
      });

      // Incrementar dataAtual de acordo com a frequência
      if (frequencia === 'semanal') {
        dataAtual = addWeeks(dataAtual, 1);
      } else if (frequencia === 'quinzenal') {
        dataAtual = addWeeks(dataAtual, 2);
      } else if (frequencia === 'mensal') {
        const currentMonth = dataAtual.getMonth();
        dataAtual = addMonths(dataAtual, 1);
        if (dataAtual.getMonth() !== (currentMonth + 1) % 12) {
          // Ajustar o dia para o último dia do mês anterior se o próximo mês tiver menos dias
          dataAtual.setDate(0);
        }
      } else {
        dataAtual = addDays(dataAtual, 1); // Frequência personalizada
      }
    }

    return eventos;
  }, [dataInicio, frequencia, horarios, profissionais, ProfissionalSelecionado]);

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
      if (ProfissionalSelecionado) {
        if (ProfissionalSelecionado === 'Mapa Cardíaco') {
          setIsMapaCardiaco(true);
          setHorarios(gerarHorariosMapaCardiaco());
        } else {
          setIsMapaCardiaco(false);
          const docRef = doc(db, 'usuarios_cadastrados', ProfissionalSelecionado);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHorarios(data.disponibilidade?.horarios || initialHorarios);
            setFrequencia(data.disponibilidade?.frequencia || 'semanal'); // Carregar a frequência
            setDataInicio(data.disponibilidade?.dataInicio?.toDate() || new Date()); // Carregar a data de início
            console.log('Horários carregados para o profissional:', data.disponibilidade?.horarios);
          } else {
            setHorarios(initialHorarios);
          }
        }
      }
    };

    fetchDisponibilidade();
  }, [ProfissionalSelecionado]);

  useEffect(() => {
    if (ProfissionalSelecionado) {
      const eventosGerados = gerarEventos();
      setEventos(eventosGerados);
      console.log('Eventos gerados:', eventosGerados);
    }
  }, [ProfissionalSelecionado, horarios, frequencia, dataInicio, gerarEventos]);

  const handleSave = async () => {
    if (ProfissionalSelecionado && !isMapaCardiaco) {
      const docRef = doc(db, 'usuarios_cadastrados', ProfissionalSelecionado);
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

  const handleHorarioChange = (event) => {
    const { name, value } = event.target;
    setHorarios((prev) => ({
      ...prev,
      [selectedDia]: {
        ...prev[selectedDia],
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

  const handleDateChange = (date) => {
    setDataInicio(date);
  };

  const handleOpenModal = (dia) => {
    setSelectedDia(dia);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
      <Box className="cards-container">
        <Card className="card-dias-semana">
          <Typography variant="h6">Dias da Semana</Typography>
          {diasDaSemana.map((dia) => (
            <Card key={dia.value} className="horario-card" onClick={() => handleOpenModal(dia.value)}>
              <Typography>{dia.label}</Typography>
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
            </Card>
          ))}
        </Card>
        <Card className="card-calendario">
          <Typography variant="h6">Calendário</Typography>
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            className="calendar"
            messages={messages}
          />
        </Card>
      </Box>
      <Box sx={{ marginTop: 3 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>Salvar Horários</Button>
      </Box>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}>
            <Typography variant="h6" component="h2">
              {diasDaSemana.find(d => d.value === selectedDia)?.label}
            </Typography>
            <TextField
              label="Hora de Início"
              type="time"
              fullWidth
              name="horaInicio"
              value={horarios[selectedDia]?.horaInicio || ''}
              onChange={handleHorarioChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              sx={{ marginTop: 2 }}
            />
            <TextField
              label="Hora de Término"
              type="time"
              fullWidth
              name="horaFim"
              value={horarios[selectedDia]?.horaFim || ''}
              onChange={handleHorarioChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              sx={{ marginTop: 2 }}
            />
            <TextField
              label="Início do Almoço"
              type="time"
              fullWidth
              name="inicioAlmoco"
              value={horarios[selectedDia]?.inicioAlmoco || ''}
              onChange={handleHorarioChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              sx={{ marginTop: 2 }}
            />
            <TextField
              label="Fim do Almoço"
              type="time"
              fullWidth
              name="fimAlmoco"
              value={horarios[selectedDia]?.fimAlmoco || ''}
              onChange={handleHorarioChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              sx={{ marginTop: 2 }}
            />
            <TextField
              label="Duração do Atendimento (minutos)"
              type="number"
              fullWidth
              name="duracaoAtendimento"
              value={horarios[selectedDia]?.duracaoAtendimento || ''}
              onChange={handleHorarioChange}
              sx={{ marginTop: 2 }}
            />
            <TextField
              label="Duração do Retorno (minutos)"
              type="number"
              fullWidth
              name="duracaoRetorno"
              value={horarios[selectedDia]?.duracaoRetorno || ''}
              onChange={handleHorarioChange}
              sx={{ marginTop: 2 }}
            />
            <Button onClick={handleCloseModal} sx={{ marginTop: 2 }}>Fechar</Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default GestaoHorario;
