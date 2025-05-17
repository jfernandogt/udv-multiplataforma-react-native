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

interface ApiPersonaAreaCientifica {
  personaareacientificaid?: number;
  personaid: number;
  areacientificaid: number;
}

interface DisplayPersonaAreaCientificaFromList
  extends ApiPersonaAreaCientifica {
  id: string;
  displayName: string;
  nombres?: string;
  apellidos?: string;
  area_cientifica?: string;
}

export default function PersonaAreaCientificaFormScreen() {
  const styles = getStyles("light");
  const router = useRouter();
  const params = useLocalSearchParams<{
    personaAreaCientificaId?: string;
    personaAreaCientificaData?: string;
  }>();

  const isEditing = !!params.personaAreaCientificaId;
  let initialData: DisplayPersonaAreaCientificaFromList | null = null;
  if (isEditing && params.personaAreaCientificaData) {
    try {
      initialData = JSON.parse(
        params.personaAreaCientificaData
      ) as DisplayPersonaAreaCientificaFromList;
    } catch (e) {
      console.error("Error parsing personaAreaCientificaData:", e);
    }
  }

  const [personaid, setPersonaid] = useState<number | undefined>(
    initialData?.personaid
  );
  const [areacientificaid, setAreacientificaid] = useState<number | undefined>(
    initialData?.areacientificaid
  );

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!personaid) errors.personaid = "El ID de Persona es obligatorio.";
    if (!areacientificaid)
      errors.areacientificaid = "El ID de Área Científica es obligatorio.";
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

    const payload: ApiPersonaAreaCientifica = {
      personaid: Number(personaid),
      areacientificaid: Number(areacientificaid),
    };

    try {
      let response;
      let responseData: ApiPersonaAreaCientifica;

      if (isEditing && initialData?.personaareacientificaid) {
        response = await fetch(
          `http://localhost:8000/personaareacientifica/${initialData.personaareacientificaid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch("http://localhost:8000/personaareacientifica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${
            errorText || "Error al guardar la relación"
          }`
        );
      }

      responseData = await response.json();

      router.replace({
        pathname: "/personaareacientifica",
        params: isEditing
          ? { updatedPersonaAreaCientifica: JSON.stringify(responseData) }
          : { newPersonaAreaCientifica: JSON.stringify(responseData) },
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
          ID Área Científica <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.areacientificaid ? styles.inputError : null,
          ]}
          value={areacientificaid?.toString() || ""}
          onChangeText={(text) =>
            setAreacientificaid(text ? parseInt(text) : undefined)
          }
          placeholder="ID del Área Científica"
          keyboardType="numeric"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.areacientificaid && (
          <Text style={styles.fieldErrorText}>
            {fieldErrors.areacientificaid}
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
            : "Agregar Relación"}
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
