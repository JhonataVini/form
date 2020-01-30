import { Component, OnInit, ValueSansProvider } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DropdownService } from '../shared/services/dropdown.service';
import { EstadoBr } from '../shared/models/estado-br';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';
import { Observable, empty } from 'rxjs';
import { FormVamlidation } from '../shared/form-validation';
import { VerificaEmailService } from './services/verifica-email.service';
import { map, tap, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BaseFormComponent } from '../shared/base-form/base-form.component';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent extends BaseFormComponent implements OnInit {


  // formulario: FormGroup;
  //  estados: EstadoBr[];
  estados: Observable<EstadoBr[]>;
  cargos: any[];
  tecnologias: any[];
  newletterOp: any[];

  frameworks = ['Angular', 'React', 'Vue', 'Sencha'];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private dropdownService: DropdownService,
    private cepService: ConsultaCepService,
    private verificaEmailService: VerificaEmailService
    ) {
      super();
    }

  ngOnInit() {

   // this.verificaEmailService.verificarEmail('email@email.com').subscribe();

    this.estados = this.dropdownService.getEstadosBr();
    this.cargos = this.dropdownService.getCargos();
    this.tecnologias = this.dropdownService.getTecnologias();
    this.newletterOp = this.dropdownService.getNewletter();
    // this.dropdownService.getEstadosBr()
    // .subscribe(dados =>  {this.estados = dados;
    //                       console.log(dados);
    // }
    // );

    //   this.formulario = new FormGroup({
    //   nome: new FormControl(null),
    //   email: new FormControl(null)
    // });

    this.formulario = this.formBuilder.group({
      nome: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required, Validators.email], this.validarEmail.bind(this)],
      confirmarEmail: [null, [FormVamlidation.equalsTo('email')]],

      endereco: this.formBuilder.group({
        cep: [null, [Validators.required, FormVamlidation.cepValidator]],
        numero: [null, Validators.required],
        complemento: [null],
        rua: [null, Validators.required],
        bairro: [null, Validators.required],
        cidade: [null, Validators.required],
        estado: [null, Validators.required],
      }),

      cargo: [null],
      tecnologias: [null],
      newletter: ['s'],
      termos: [null, Validators.pattern('true')],
      frameworks: this.buildFrameworks()
    });

    this.formulario.get('endereco.cep').statusChanges
    .pipe(
      distinctUntilChanged(),
      tap(value => console.log('Status CEP: ', value)),
      switchMap(status => status === 'VALID' ?
      this.cepService.consultaCEP(this.formulario.get('endereco.cep').value)
       : empty()
       )
      )
    .subscribe(dados => dados ? this.populaDadosForm(dados) : {});

      // 2° forma de se fazer

        /* this.cepService.consultaCEP(this.formulario.get('endereco.cep').value)
         .subscribe(dados => this.populaDadosForm(dados));

         this.resetaDadosForm();

         this.http.get(`//viacep.com.br/ws/${this.formulario.get('endereco.cep').value}/json`)
         .subscribe(dados => this.populaDadosForm(dados));*/

    }

  buildFrameworks() {
    const values = this.frameworks.map(v => new FormControl(false));
    return this.formBuilder.array(values, FormVamlidation.requiredMinCheckbox(1));

    // return [
    //   new FormControl(false)
    // ]
  }
  submit() {
    console.log(this.formulario);
    let valueSubmit = Object.assign({}, this.formulario.value);

    valueSubmit = Object.assign(valueSubmit, {
      frameworks: valueSubmit.frameworks
        .map((v, i) => v ? this.frameworks[i] : null)
        .filter(v => v !== null)
    });

    console.log(valueSubmit);

    this.http.post('https://httpbin.org/post', JSON.stringify({}))
    .subscribe(dados => {
      console.log(dados);
      // reseta o form
      this.resetar();
    },
      (error: any) => alert('Erro'));
  }

  consultaCEP() {
    let cep = this.formulario.get('endereco.cep').value;
    // Nova variável "cep" somente com dígitos.
    cep = cep.replace(/\D/g, '');

    // Expressão regular para validar o CEP.
    const validacep = /^[0-9]{8}$/;

    // Valida o formato do CEP.
    if (validacep.test(cep) && cep !== '') {

      this.cepService.consultaCEP(cep)
        .subscribe(dados => this.populaDadosForm(dados));

      this.resetaDadosForm();

      // this.http.get(`//viacep.com.br/ws/${cep}/json`)
      //   .subscribe(dados => this.populaDadosForm(dados));
    }

  }

  populaDadosForm(dados) {
    // formulario.setValue({
    //     nome  : formulario.value.nome,
    //     email: formulario.value.email,

    // });
    this.formulario.patchValue({
      endereco: {
        rua: dados.logradouro,
        complemento: dados.complemento,
        bairro: dados.bairro,
        cidade: dados.localidade,
        estado: dados.uf
      }
    });
  }

  resetaDadosForm() {
    this.formulario.patchValue({
      endereco: {
        rua: null,
        complemento: null,
        bairro: null,
        cidade: null,
        estado: null,
      }
    });
  }
  setarCargo() {
    const cargo = { nome: 'Dev', nivel: 'Pleno', desc: 'Dev Pl' };
    this.formulario.get('cargo').setValue(cargo);
  }
  compararCargos(obj1, obj2) {
    return obj1 && obj2 ? (obj1.nome === obj2.nome && obj1.nivel === obj2.nivel) : obj1 === obj2;
  }

  setarTecnologias() {
    this.formulario.get('tecnologias').setValue(['java', 'javascript', 'c#']);
  }

  validarEmail(formControl: FormControl) {
    return this.verificaEmailService.verificarEmail(formControl.value)
      .pipe(
        map(emailExiste => emailExiste ? { emailInvalido: true} : null)
        );
  }

}

// consultaCEP(cep, form) {

//   // Nova variável "cep" somente com dígitos.
//  cep = cep.replace(/\D/g, '');

//  if (cep != null && cep !== '') {
//    this.cepService.consultaCEP(cep)
//        .subscribe(dados => this.populaDadosForm(dados, form));
//   }
//  }


// consultaCEP() {
//   let cep = this.formulario.get('endereco.cep').value;

//   if (cep != null && cep !== '') {
//     this.cepService.consultaCEP(cep)
//     .subscribe(dados => this.populaDadosForm(dados));
//   }
//  }



// consultaCEP() {
//   let cep = this.formulario.get('endereco.cep').value;
//    // Nova variável "cep" somente com dígitos.
//   cep = cep.replace(/\D/g, '');

//    // Verifica se campo cep possui valor informado.
//   if (cep !== '') {

//   // Expressão regular para validar o CEP.
//    var validacep = /^[0-9]{8}$/;

//    // Valida o formato do CEP.
//    if (validacep.test(cep)) {

//      this.resetaDadosForm();

//      this.http.get(`//viacep.com.br/ws/${cep}/json`)
//         .map(dados => dados)
//         .subscribe(dados => this.populaDadosForm(dados));
//    }
//   }
//  }
