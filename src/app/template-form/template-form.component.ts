import { Component, OnInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.css']
})
export class TemplateFormComponent implements OnInit {

  usuario: any = {
    nome: null,
    email: null
  };

  onSubmit(form) {
    console.log(form);
    // console.log(this.usuario);
    this.http.post('https://httpbin.org/post', JSON.stringify(form.value))
    .subscribe(dados => {
      console.log(dados);
      form.form.reset();
    });
  }

  constructor(
    private http: HttpClient,
    private cepService: ConsultaCepService
    ) { }

  ngOnInit() {
  }

  verificaValidTouched(campo) {
    return !campo.valid && campo.touched;
  }

  aplicaCssErro(campo) {

      return{
        'has-error': this.verificaValidTouched(campo),
        'has-feedback': this.verificaValidTouched(campo),
      };
    }

    consultaCEP(cep, form) {

     // Nova variável "cep" somente com dígitos.
    cep = cep.replace(/\D/g, '');

    // Expressão regular para validar o CEP.
    const validacep = /^[0-9]{8}$/;

    // Valida o formato do CEP.
    if (validacep.test(cep) && cep !== '') {
      // this.cepService.consultaCEP(cep)
      // .subscribe(dados => this.populaDadosForm(dados, form));

      this.resetaDadosForm(form);

      this.http.get(`//viacep.com.br/ws/${cep}/json`)
          .subscribe(dados => this.populaDadosForm(dados, form));
     }
  }
    populaDadosForm(dados, formulario) {
      // formulario.setValue({
      //     nome  : formulario.value.nome,
      //     email: formulario.value.email,

      // });

      formulario.form.patchValue({
        endereco: {
          rua: dados.logradouro,
          complemento: dados.complemento,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf,
      }
      });
    }
    resetaDadosForm(formulario) {
      formulario.form.patchValue({
        endereco: {
          rua: null,
          complemento: null,
          bairro: null,
          cidade: null,
          estado: null,
      }
      });
    }
}
