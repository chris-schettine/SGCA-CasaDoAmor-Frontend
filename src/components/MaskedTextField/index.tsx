import React from 'react';
import { TextField, type InputBaseComponentProps, type TextFieldProps } from '@mui/material'; // Importe InputBaseComponentProps
import { IMaskInput } from 'react-imask';

// estendendo InputBaseComponentProps para garantir compatibilidade com o TextField
interface MaskedInputProps extends InputBaseComponentProps {
  mask: string | (string | RegExp)[];
  definitions?: { [key: string]: RegExp };
  lazy?: boolean;
  overwrite?: boolean;
}

const MaskedInput = React.forwardRef<HTMLElement, MaskedInputProps>(
  function MaskedInput(props, ref) {
    const { onChange, mask, definitions, lazy, overwrite, ...other } = props;

    return (
      <IMaskInput
        {...other}
        mask={mask}
        definitions={definitions}
        lazy={lazy}
        overwrite={overwrite}
        inputRef={ref as React.Ref<HTMLInputElement>}
        onAccept={(value: string) => {
          onChange({
            target: {
              name: props.name,
              value: value,
            },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      />
    );
  },
);

// Componente MaskedTextField que combina Material-UI TextField e IMaskInput
interface Props extends Omit<TextFieldProps, 'InputProps' | 'name'> { // Remova 'name' do Omit, pois ele é obrigatório
  mask: string | (string | RegExp)[];
  definitions?: { [key: string]: RegExp };
  lazy?: boolean;
  overwrite?: boolean;
  name: string;
  /**
   * Nome acessível explícito para leitores de tela
   */
  ariaLabel?: string;
  slotProps?: {
    inputLabel?: TextFieldProps['InputLabelProps']; // Reutiliza o tipo que o MUI espera
    formHelperText?: TextFieldProps['FormHelperTextProps']; // Reutiliza o tipo
  };
  InputProps?: TextFieldProps['InputProps'];
}

const MaskedTextField: React.FC<Props> = ({
  mask,
  definitions,
  lazy = false,
  overwrite = true,
  helperText,
  error,
  value,
  ariaLabel,
  slotProps,
  InputProps: parentInputProps,
  ...rest
}) => {
  return (
    <TextField
      {...rest}
      value={value}
      error={error}
      helperText={helperText || " "}
      InputProps={{
        ...(parentInputProps || {}),
        inputComponent: MaskedInput,
        inputProps: {
          mask,
          definitions,
          lazy,
          overwrite,
          // Ensure aria-label is always a string to satisfy strict typing
          'aria-label': String(ariaLabel ?? rest.label ?? rest.name),
        },
      }}
      slotProps={{
        inputLabel: {
          ...(slotProps?.inputLabel || {}),
        },
        formHelperText: {
          ...(slotProps?.formHelperText || {}),
          sx: {
            maxHeight: '0.4em',
            margin: '0 0.2em',
            padding: 0,
            ...(slotProps?.formHelperText?.sx || {}),
          },
        },
      }}
    />
  );
};

export default MaskedTextField;
