import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EstadoBr } from '../models/estado-br';
import { Cidade } from '../models/cidade';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class DropdownService {

  constructor(private hhtp: HttpClient) { }

  getEstadosBr() {
    return this.hhtp.get<EstadoBr[]>('assets/dados/estadosbr.json');
  }

  getCidades(idEstado: number) {
    return this.hhtp.get<Cidade[]>('assets/dados/cidades.json')
    .pipe(
      map((cidades: Cidade[]) => cidades.filter(c => c.estado === idEstado))
    );
  }

  getCargos() {
    return [
      { nome: 'Dev', nivel: 'Junior', desc: 'Dev Jr'},
      { nome: 'Dev', nivel: 'Pleno', desc: 'Dev Pl'},
      { nome: 'Dev', nivel: 'Senior', desc: 'Dev Sr'}
    ];
  }

  getTecnologias() {
    return [
      {nome: 'java', desc: 'Java'},
      {nome: 'javascript', desc: 'JavaScript'},
      {nome: 'php', desc: 'Php'},
      {nome: 'c#', desc: 'C#'},
    ];
  }
  getNewletter() {
    return [
      {valor: 's', desc: 'Sim'},
      {valor: 'n', desc: 'Não'}
    ]
  }
}
