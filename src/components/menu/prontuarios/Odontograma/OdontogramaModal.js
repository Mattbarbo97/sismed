import React, { useState } from "react";
import { Modal, Paper, Typography, Button } from "@mui/material";
import "./OdontogramaModal.css";

const dentesSuperiores = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28"
];

const dentesInferiores = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38"
];

const OdontogramaModal = ({ open, onClose, onDenteSelecionado, evolucaoAtual }) => {
  const [dentesSelecionados, setDentesSelecionados] = useState([]);

  const handleClick = (dente) => {
    setDentesSelecionados((prev) =>
      prev.includes(dente) ? prev.filter((d) => d !== dente) : [...prev, dente]
    );
  };

  const handleConfirmar = () => {
    if (dentesSelecionados.length > 0) {
      // Verifica se já existe "Dente" na string antes de adicionar
      const listaDentesFormatada = dentesSelecionados
        .map((dente) => (dente.startsWith("Dente") ? dente : `Dente ${dente}`))
        .join("\n");

      // Atualiza corretamente sem duplicar "Dente"
      const novaEvolucao = evolucaoAtual
        ? `${evolucaoAtual.trim()}\n${listaDentesFormatada}`.trim()
        : listaDentesFormatada;

      onDenteSelecionado(novaEvolucao);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: "absolute",
          bgcolor: "background.paper",
          width: "70%",
          p: 4,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <Typography variant="h6">Selecione os Dentes</Typography>

        {/* Odontograma com HTML + CSS */}
        <div className="odontograma">
          {/* Arcada Superior */}
          <div className="arcada">
            {dentesSuperiores.map((dente) => (
              <div
                key={dente}
                className={`dente ${dentesSelecionados.includes(dente) ? "selecionado" : ""}`}
                onClick={() => handleClick(dente)}
              >
                {dente}
              </div>
            ))}
          </div>

          {/* Linha Divisória */}
          <div className="linha-divisoria"></div>

          {/* Arcada Inferior */}
          <div className="arcada">
            {dentesInferiores.map((dente) => (
              <div
                key={dente}
                className={`dente ${dentesSelecionados.includes(dente) ? "selecionado" : ""}`}
                onClick={() => handleClick(dente)}
              >
                {dente}
              </div>
            ))}
          </div>
        </div>

        {dentesSelecionados.length > 0 && (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Dentes selecionados:
            <pre className="lista-dentes">{dentesSelecionados.map((d) => `Dente ${d}`).join("\n")}</pre>
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleConfirmar}
          disabled={dentesSelecionados.length === 0}
        >
          Confirmar Seleção
        </Button>
      </Paper>
    </Modal>
  );
};

export default OdontogramaModal;
