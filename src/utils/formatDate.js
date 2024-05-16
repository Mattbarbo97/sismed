// //formatDate.js
// const formatDate = (data) => {
//     const dia = data.getDate();
//     const mes = data.getMonth() + 1; // Os meses são indexados a partir de 0
//     const ano = data.getFullYear();

//     if (mes < 10) return `${dia}/0${mes}/${ano}`; // Adiciona um zero à esquerda do mês (01, 02, ..., 09

//     return `${dia}/${mes}/${ano}`;
// };
// export default formatDate;


const formatDate = (data) => {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0'); // Os meses são indexados a partir de 0
    const ano = data.getFullYear();
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
  
    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  };
  
  export default formatDate;
  