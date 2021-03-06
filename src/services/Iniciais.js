export default function Iniciais(profile, letras = 2) {
  const { nome, sobrenome } = profile;

  const tudojunto = `${nome} ${sobrenome}`;

  const todasIniciais = [];

  const ignorar = ['de', 'dos', 'das', 'da', 'do'];
  tudojunto.split(' ').map(element => {
    if (!ignorar.includes(element.trim().toLowerCase())) {
      todasIniciais.push(element.substring(0, 1));
    }
  });
  console.log(todasIniciais.length - 1);

  if (todasIniciais.length == 0) {
    return '';
  }
  let iniciais = '';
  switch (letras) {
    case 1:
      iniciais = todasIniciais[0];
      break;
    case 2:
      if (todasIniciais.length >= 2) {
        iniciais = todasIniciais[0] + todasIniciais[todasIniciais.length - 1];
      } else {
        iniciais = todasIniciais[0];
      }
      break;
    case 3:
      if (todasIniciais.length >= 3) {
        iniciais =
          todasIniciais[0] +
          todasIniciais[1] +
          todasIniciais[todasIniciais.length - 1];
      } else {
        iniciais = todasIniciais[0];
      }
      break;
    case 4:
      if (todasIniciais.length >= 4) {
        iniciais =
          todasIniciais[0] +
          todasIniciais[1] +
          todasIniciais[2] +
          todasIniciais[todasIniciais.length - 1];
      } else {
        iniciais = todasIniciais[0];
      }
      break;
    default:
      iniciais = todasIniciais[0];
      break;
  }
  return iniciais;
}
