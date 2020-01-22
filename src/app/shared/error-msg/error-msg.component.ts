import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormVamlidation } from '../form-validation';

@Component({
  selector: 'app-error-msg',
  templateUrl: './error-msg.component.html',
  styleUrls: ['./error-msg.component.css']
})
export class ErrorMsgComponent implements OnInit {

 // @Input() mostrarErro: boolean;
 // @Input() mgsErro: string;

  @Input() control: FormControl;
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }


  get ErrorMessage() {

    for (const propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) &&
      this.control.touched) {
        // TODO
        return FormVamlidation.getErrorMsg(this.label, propertyName, this.control.errors[propertyName]);
      }
    }
    return null;
  }
}
