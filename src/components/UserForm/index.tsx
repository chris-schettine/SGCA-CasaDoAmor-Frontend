import { Box, Chip, FormControl, Grid, InputLabel, MenuItem, Select, TextField, FormHelperText } from "@mui/material";
import MaskedTextField from "../MaskedTextField";
import { type UseFormRegister, type FieldErrors, Controller, type Control } from "react-hook-form";
import type { UserFormInputs } from "../../schemas/userSchema";

interface UserFormProps {
  register: UseFormRegister<UserFormInputs>;
  errors: FieldErrors<UserFormInputs>;
  control: Control<UserFormInputs>;
}


const perfisDisponiveis = [
  { id: 1, nome: "Admin" },
  { id: 2, nome: "Médico" },
  { id: 3, nome: "Enfermeira" },
  { id: 4, nome: "Nutricionista" },
];

const UserForm = (
  {
    register,
    errors,
    control,
  }: UserFormProps
) => {

  

  return (
    <>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ padding: '0 26px', maxWidth: '1200px' }}>

        {/* PRIMEIRA LINHA: Tipo do profissional (Correto) */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="tipo"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.tipo}>
                <InputLabel id="tipo-profissional-label">Tipo de Profissional</InputLabel>
                <Select
                  {...field}
                  labelId="tipo-profissional-label"
                  id="tipo"
                  label="Tipo de Profissional"
                >
                  <MenuItem value={"RECEPCIONISTA"}>Recepcionista</MenuItem>
                  <MenuItem value={"MEDICO"}>Médico</MenuItem>
                  <MenuItem value={"ENFERMEIRA"}>Enfermeira</MenuItem>
                </Select>
                {errors.tipo && <FormHelperText sx={{ maxHeight: 0, margin: '0 0.2em' }}>{errors.tipo.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {/* NOVO CAMPO: Perfis de Acesso */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="perfisIds" 
            control={control}
            defaultValue={[]} 
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.perfisIds}>
                <InputLabel id="perfis-label">Perfis de Acesso</InputLabel>
                <Select
                  {...field}
                  labelId="perfis-label"
                  id="perfisIds"
                  multiple 
                  label="Perfis de Acesso"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((id) => {
                        const perfil = perfisDisponiveis.find(p => p.id === id);
                        return <Chip key={id} label={perfil ? perfil.nome : id} />;
                      })}
                    </Box>
                  )}
                >
                  {perfisDisponiveis.map((perfil) => (
                    <MenuItem key={perfil.id} value={perfil.id}>
                      {perfil.nome}
                    </MenuItem>
                  ))}
                </Select>
                {errors.perfisIds && <FormHelperText sx={{ maxHeight: 0, margin: '0 0.2em' }}>{errors.perfisIds.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {/* SEGUNDA LINHA: Email, Telefone e CPF (Sem alterações) */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            fullWidth
            placeholder="Digite o email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            slotProps={{
              formHelperText: {
                sx: {
                  maxHeight: 0,
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <MaskedTextField
                {...field}
                id="telefone"
                label="Telefone"
                variant="outlined"
                fullWidth
                placeholder="00 00000-0000"
                error={!!errors.telefone}
                helperText={errors.telefone?.message}
                mask="00 00000-0000"
                lazy={true}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="cpfUsuario"
            control={control}
            render={({ field }) => (
              <MaskedTextField
                {...field}
                id="cpf-paciente"
                label="CPF"
                variant="outlined"
                fullWidth
                placeholder="000.000.000-00"
                error={!!errors.cpfUsuario}
                helperText={errors.cpfUsuario?.message}
                mask="000.000.000-00"
                lazy={true}
              />
            )}
          />
        </Grid>

        {/* TERCEIRA LINHA: Nome e Sexo (Sem alterações) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            id="nomeUsuario"
            label="Nome completo"
            variant="outlined"
            fullWidth
            placeholder="Digite o nome completo"
            {...register("nomeUsuario")}
            error={!!errors.nomeUsuario}
            helperText={errors.nomeUsuario?.message}
            slotProps={{
              formHelperText: {
                sx: {
                  maxHeight: 0,
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            id="sexo"
            label="Sexo"
            variant="outlined"
            fullWidth
            placeholder="Digite o sexo"
            {...register("sexo")}
            error={!!errors.sexo}
            helperText={errors.sexo?.message}
            slotProps={{
              formHelperText: {
                sx: {
                  maxHeight: 0,
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>

        {/* QUARTA LINHA: Conselho, registro e UF (Sem alterações) */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="conselho"
            label="Conselho"
            variant="outlined"
            fullWidth
            placeholder="Conselho"
            {...register("conselho")}
            error={!!errors.conselho}
            helperText={errors.conselho?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="registro"
            label="Registro"
            variant="outlined"
            fullWidth
            placeholder="Registro"
            {...register("registro")}
            error={!!errors.registro}
            helperText={errors.registro?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="uf"
            label="UF"
            variant="outlined"
            fullWidth
            placeholder="UF"
            {...register("uf")}
            error={!!errors.uf}
            helperText={errors.uf?.message}
          />
        </Grid>

        {/* QUINTA LINHA: C.B.O., RQE, CNES (Sem alterações) */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="cbo"
            label="CBO"
            variant="outlined"
            fullWidth
            placeholder="CBO"
            {...register("cbo")}
            error={!!errors.cbo}
            helperText={errors.cbo?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="rqe"
            label="RQE"
            variant="outlined"
            fullWidth
            placeholder="RQE"
            {...register("rqe")}
            error={!!errors.rqe}
            helperText={errors.rqe?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="cnes"
            label="CNES"
            variant="outlined"
            fullWidth
            placeholder="CNES"
            {...register("cnes")}
            error={!!errors.cnes}
            helperText={errors.cnes?.message}
          />
        </Grid>

        {/* SEXTA LINHA: Senha e confirmar senha (REMOVIDO) */}

        {/* SÉTIMA LINHA: Perguntas de segurança 1 e 2 (Sem alterações) */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="pergunta1"
            label="Pergunta de segurança 1"
            variant="outlined"
            fullWidth
            placeholder="Pergunta de segurança 1"
            multiline
            rows={2}
            {...register("pergunta1")}
            error={!!errors.pergunta1}
            helperText={errors.pergunta1?.message}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="pergunta2"
            label="Pergunta de segurança 2"
            variant="outlined"
            fullWidth
            placeholder="Pergunta de segurança 2"
            multiline
            rows={2}
            {...register("pergunta2")}
            error={!!errors.pergunta2}
            helperText={errors.pergunta2?.message}
            slotProps={{
              formHelperText: {
                sx: {
                  maxHeight: 0,
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </>
  )
};

export default UserForm;