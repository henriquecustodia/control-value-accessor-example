import { NgClass } from "@angular/common";
import { Component, forwardRef, signal } from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { RouterOutlet } from "@angular/router";

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: "app-button-selector",
  standalone: true,
  template: `
    @for (option of options(); track option.value) {
    <button
      [disabled]="isDisabled()"
      [ngClass]="{ selected: selectedOption()?.value === option.value }"
      (click)="onSelect(option)"
    >
      {{ option.label }}
    </button>
    }
  `,
  styles: `
    .selected {
      background-color: red;
    }
  `,
  imports: [NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonSelector),
      multi: true,
    },
  ],
})
export class ButtonSelector implements ControlValueAccessor {
  selectedOption = signal<Option | null>(null);

  options = signal<Option[]>([
    { label: "Opção 1", value: "1" },
    { label: "Opção 2", value: "2" },
  ]);

  isDisabled = signal<boolean>(false);

  onChange!: (value: string) => void;
  onTouched!: () => void;

  writeValue(optionValue: any): void {
    if (optionValue) {
      const option = this.options().find(
        (option) => option.value === optionValue
      );

      if (option) {
        this.selectedOption.set(option);
      }
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onSelect(option: Option) {
    if (this.selectedOption()?.value === option.value) {
      return;
    }

    this.selectedOption.set(option);
    this.onChange(option.value);
    this.onTouched();
  }
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ButtonSelector, ReactiveFormsModule],
  template: `
    <app-button-selector [formControl]="control"></app-button-selector>

    <div>
      <strong>Opção selecionada: {{ control.value }}</strong>
    </div>
    <div>
      <button (click)="onDisable()">Disabilitar</button>
      <button (click)="onEnable()">Habilitar</button>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  control = new FormControl();

  constructor() {
    this.control.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }

  onDisable() {
    this.control.disable();
  }

  onEnable() {
    this.control.enable();
  }
}
