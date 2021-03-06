import styled from 'styled-components';

import Scrollbar from 'react-perfect-scrollbar';

export const Container = styled.div`
  background: #fff;
  height: 100%;
  display: flex;
  width:100%;
  flex: 1;
  padding: 10px;
  div.produtos-disponiveis {
    width: 100%;
    max-width: 600px;
    @media only screen and (max-width: 1400px) {
      width: 50%;
    }
    div.linha-topo {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 0 10px 10px 10px;
      button {
        min-width: 150px;
        margin-left: 10px;
        height: 30px;
      }
    }

    div.busca {
      display: flex;
      flex-direction: row;

      height: 30px;
      width: 100%;
      border-radius: 4px;
      svg {
        width: 20px;
        height: auto;
        margin: 0 5px;
      }
      input {
        width: calc(100% - 30px);
        border: 0;
        background: transparent;
      }
    }

    table {
      width: fit-content;
      margin-top: 10px;
      border-color: #ddd;

      thead tr th {
        min-width: 100px;
        background: #ddd;
      }
    }

    div.produto {
      background: #eee;
      padding: 10px;
      border-radius: 4px;

      & + div.produto {
        margin-top: 10px;
      }
    }

    div.linha {

      div.input-fretes{
        display: flex;
        input{
          border: 1px solid #ccc;
          padding: 5px;
          border-radius:4px;
          width: 80px;
        }

        input.frete-direto{
          margin-right: 10px;
        }




      }
      width: 100%;
      strong {
        margin-right: 5px;
      }
    }

    div.produto-header {
      margin-bottom: 5px;
      align-items: center;
      button.open-close {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: flex;
        align-items: center;
        padding: 0;
        width: 100%;
        height: 30px;
        margin-right: 5px;
        border: 0;
        background: transparent;

        svg {
          display: block;
          margin-right: 5px;
        }
      }
      button.editar {
        display: flex;
        align-items: center;
        padding: 0;
        width: 30px;
        height: 30px;
        border: 0;
        background: #eee;
        border-radius: 4px;
        &:hover {
          background: #f5f5f5;
        }

        svg {
          display: block;
          margin: auto;
        }
      }
    }
  }
  div.edit {
    margin-top: 10px;
  }

  table {
    margin-top: 10px;
    width: 100%;

    button.remove-custo{
      display:block;
      width: 25px;
      height: 25px;
      padding: 0;
      margin: auto;
      border-radius: 4px;
      svg{
        display: block;
        margin: auto;
      }
    }

    thead tr th {
      padding: 0 5px;
      text-align: left;
    }

    thead tr th.nome-custo {
      width: 80%;
    }

    thead tr th.valor-custo {
      width: 20%;
    }

    thead tr th.remove-custo {
      min-width: 40px;
      }
    }
  }


  div.editar-produto {
    width: 50%;
    border: 1px solid #eee;
    padding: 10px;
    border-radius: 8px;
    width:100%;
    line-height: 25px;
    strong + span {
      margin-left: 10px;
    }

    table {
      thead{
        th.estado{
          width: 40%;
        }
        th.direto{
          width: 30%;
        }
        th.distrib{
          width: 30%;
        }
        th.add{
          width: 30px;
        }
        th.uf-frete{
          width: 20%;
        }
        th.valor-custo{
          width: 40%;
        }
        th.remove-custo{
          width: 30px;
        }
      }
      tbody{
        tr{
          td{
            input, select  {
              height: 30px;
              border: 1px solid #eee;
              border-radius: 4px;
              padding: 5px;
              width: 100%;
            }
            button.btn-add-custo {
              width: 100%;
              margin-left: 10px;
            }

            button.btn-salvar {
              margin-left: auto;
              margin-top: 10px;
            }
          }
        }
      }
    }






`;

export const ScroollProd = styled(Scrollbar)`
  max-height: calc(100% - 40px);
  padding-right: 15px;
  margin-right: 5px;
`;
