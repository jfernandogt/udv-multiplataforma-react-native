import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface ApiPersona {
  personaid?: number;
  nombres: string;
  apellidos: string;
  telefono?: string;
  celular?: string;
  correo: string;
  direccion?: string;
  municipioidnacimiento?: number;
  fechanacimiento?: string;
  cui?: string;
  pasaporte?: string;
  tiporol?: string;
}

interface DisplayPersonaFromList extends ApiPersona {
  id: string;
  displayName: string;
}

export default function PersonaFormScreen() {
  const styles = getStyles("light");
  const router = useRouter();
  const params = useLocalSearchParams<{
    personaId?: string;
    personaData?: string;
  }>();

  const isEditing = !!params.personaId;
  let initialData: DisplayPersonaFromList | null = null;
  if (isEditing && params.personaData) {
    try {
      initialData = JSON.parse(params.personaData) as DisplayPersonaFromList;
    } catch (e) {
      console.error("Error parsing personaData:", e);
    }
  }

  const [nombres, setNombres] = useState(initialData?.nombres || "");
  const [apellidos, setApellidos] = useState(initialData?.apellidos || "");
  const [correo, setCorreo] = useState(initialData?.correo || "");
  const [telefono, setTelefono] = useState(initialData?.telefono || "");
  const [celular, setCelular] = useState(initialData?.celular || "");
  const [direccion, setDireccion] = useState(initialData?.direccion || "");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
    if (!apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
    if (!correo.trim()) {
      errors.correo = "El correo es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      errors.correo = "El formato del correo no es válido.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      setFormError("Por favor, corrige los errores en el formulario.");
      return;
    }
    setFormError(null);
    setLoading(true);

    const personaPayload: ApiPersona = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      correo: correo.trim(),
      telefono: telefono?.trim() || undefined,
      celular: celular?.trim() || undefined,
      direccion: direccion?.trim() || undefined,
    };

    try {
      let response;
      let responseData: ApiPersona;

      if (isEditing && initialData?.personaid) {
        response = await fetch(
          `http://localhost:8000/personas/${initialData.personaid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(personaPayload),
          }
        );
      } else {
        response = await fetch("http://localhost:8000/personas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(personaPayload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || "Error al guardar persona"}`
        );
      }

      responseData = await response.json();

      router.replace({
        pathname: "/personas",
        params: isEditing
          ? { updatedPersona: JSON.stringify(responseData) }
          : { newPersona: JSON.stringify(responseData) },
      });
    } catch (e: any) {
      console.error("Error al guardar persona:", e);
      setFormError(e.message || "Ocurrió un error inesperado.");
      Alert.alert("Error", e.message || "No se pudo guardar la información.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {formError && <Text style={styles.formErrorText}>{formError}</Text>}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Nombres <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, fieldErrors.nombres ? styles.inputError : null]}
          value={nombres}
          onChangeText={setNombres}
          placeholder="Ej. Juan Carlos"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.nombres && (
          <Text style={styles.fieldErrorText}>{fieldErrors.nombres}</Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Apellidos <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.apellidos ? styles.inputError : null,
          ]}
          value={apellidos}
          onChangeText={setApellidos}
          placeholder="Ej. Pérez García"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.apellidos && (
          <Text style={styles.fieldErrorText}>{fieldErrors.apellidos}</Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Correo Electrónico <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, fieldErrors.correo ? styles.inputError : null]}
          value={correo}
          onChangeText={setCorreo}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.correo && (
          <Text style={styles.fieldErrorText}>{fieldErrors.correo}</Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej. 2233-4455"
          keyboardType="phone-pad"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Celular</Text>
        <TextInput
          style={styles.input}
          value={celular}
          onChangeText={setCelular}
          placeholder="Ej. 5566-7788"
          keyboardType="phone-pad"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Ej. Zona 1, Ciudad"
          multiline
          numberOfLines={3}
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
          textAlignVertical="top"
        />
      </View>
      <Pressable
        style={[styles.saveButton, loading ? styles.saveButtonDisabled : null]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.light.background} />
        ) : (
          <IconSymbol
            name={isEditing ? "checkmark.circle.fill" : "plus.circle.fill"}
            size={20}
            color={Colors.light.background}
          />
        )}
        <Text style={styles.saveButtonText}>
          {loading
            ? isEditing
              ? "Guardando..."
              : "Agregando..."
            : isEditing
            ? "Guardar Cambios"
            : "Agregar Persona"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    formErrorText: {
      color: Colors[colorScheme].error,
      fontSize: 15,
      textAlign: "center",
      marginBottom: 15,
      fontWeight: "bold",
    },
    inputGroup: {
      marginBottom: 18,
    },
    label: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      marginBottom: 8,
      fontWeight: "500",
    },
    requiredIndicator: {
      color: Colors[colorScheme].error,
    },
    input: {
      backgroundColor: Colors[colorScheme].card,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border || "#ccc",
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: Platform.OS === "ios" ? 15 : 12,
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    inputError: {
      borderColor: Colors[colorScheme].error,
    },
    fieldErrorText: {
      color: Colors[colorScheme].error,
      fontSize: 13,
      marginTop: 4,
    },
    saveButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    saveButtonDisabled: {
      backgroundColor: Colors[colorScheme].disabled || "#a5a5a5", // Define Colors.light.disabled
    },
    saveButtonText: {
      color: Colors[colorScheme].background,
      fontSize: 17,
      fontWeight: "bold",
      marginLeft: 10,
    },
  });
