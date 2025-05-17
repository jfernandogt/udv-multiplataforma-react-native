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

interface ApiTitulo {
  tituloid?: number;
  personaid: number;
  carreraid: number;
  fechagraduacion: string; // YYYY-MM-DD
}

interface DisplayTituloFromList extends ApiTitulo {
  id: string;
  displayName: string;
  nombres?: string;
  apellidos?: string;
  carrera?: string;
  formattedFechaGraduacion?: string;
}

export default function TituloFormScreen() {
  const styles = getStyles("light");
  const router = useRouter();
  const params = useLocalSearchParams<{
    tituloId?: string;
    tituloData?: string;
  }>();

  const isEditing = !!params.tituloId;
  let initialData: DisplayTituloFromList | null = null;
  if (isEditing && params.tituloData) {
    try {
      initialData = JSON.parse(params.tituloData) as DisplayTituloFromList;
    } catch (e) {
      console.error("Error parsing tituloData:", e);
    }
  }

  const [personaid, setPersonaid] = useState<number | undefined>(
    initialData?.personaid
  );
  const [carreraid, setCarreraid] = useState<number | undefined>(
    initialData?.carreraid
  );
  // Store fechaGraduacion as YYYY-MM-DD string for the input
  const [fechagraduacion, setFechagraduacion] = useState(
    initialData?.fechagraduacion
      ? initialData.fechagraduacion.split("T")[0]
      : ""
  );

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!personaid) errors.personaid = "El ID de Persona es obligatorio.";
    if (!carreraid) errors.carreraid = "El ID de Carrera es obligatorio.";
    if (!fechagraduacion.trim()) {
      errors.fechagraduacion = "La fecha de graduación es obligatoria.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fechagraduacion.trim())) {
      errors.fechagraduacion = "Formato de fecha debe ser YYYY-MM-DD.";
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

    const payload: ApiTitulo = {
      personaid: Number(personaid),
      carreraid: Number(carreraid),
      fechagraduacion: fechagraduacion.trim(), // Ensure it's YYYY-MM-DD
    };

    try {
      let response;
      let responseData: ApiTitulo;

      if (isEditing && initialData?.tituloid) {
        response = await fetch(
          `http://localhost:8000/titulo/${initialData.tituloid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch("http://localhost:8000/titulo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${
            errorText || "Error al guardar el título"
          }`
        );
      }

      responseData = await response.json();
      // The API returns fechagraduacion as ISO string, ensure it's passed correctly
      // or rely on the index screen to re-fetch/re-format if necessary.

      router.replace({
        pathname: "/titulo",
        params: isEditing
          ? { updatedTitulo: JSON.stringify(responseData) }
          : { newTitulo: JSON.stringify(responseData) },
      });
    } catch (e: any) {
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
          ID Persona <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.personaid ? styles.inputError : null,
          ]}
          value={personaid?.toString() || ""}
          onChangeText={(text) =>
            setPersonaid(text ? parseInt(text) : undefined)
          }
          placeholder="ID de la Persona"
          keyboardType="numeric"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.personaid && (
          <Text style={styles.fieldErrorText}>{fieldErrors.personaid}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          ID Carrera <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.carreraid ? styles.inputError : null,
          ]}
          value={carreraid?.toString() || ""}
          onChangeText={(text) =>
            setCarreraid(text ? parseInt(text) : undefined)
          }
          placeholder="ID de la Carrera"
          keyboardType="numeric"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.carreraid && (
          <Text style={styles.fieldErrorText}>{fieldErrors.carreraid}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Fecha Graduación (YYYY-MM-DD){" "}
          <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.fechagraduacion ? styles.inputError : null,
          ]}
          value={fechagraduacion}
          onChangeText={setFechagraduacion}
          placeholder="Ej. 2023-12-31"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
          autoCapitalize="none"
        />
        {fieldErrors.fechagraduacion && (
          <Text style={styles.fieldErrorText}>
            {fieldErrors.fechagraduacion}
          </Text>
        )}
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
            : "Agregar Título"}
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
      backgroundColor: Colors[colorScheme].disabled || "#a5a5a5",
    },
    saveButtonText: {
      color: Colors[colorScheme].background,
      fontSize: 17,
      fontWeight: "bold",
      marginLeft: 10,
    },
  });
