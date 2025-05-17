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

interface ApiInvestigacionPersona {
  investigacionpersonaid?: number;
  investigacionid: number;
  personaid: number;
  rol: string;
}

interface DisplayInvestigacionPersonaFromList extends ApiInvestigacionPersona {
  id: string;
  displayName: string;
  titulo_investigacion?: string;
  nombres?: string;
  apellidos?: string;
}

export default function InvestigacionPersonaFormScreen() {
  const styles = getStyles("light");
  const router = useRouter();
  const params = useLocalSearchParams<{
    investigacionPersonaId?: string;
    investigacionPersonaData?: string;
  }>();

  const isEditing = !!params.investigacionPersonaId;
  let initialData: DisplayInvestigacionPersonaFromList | null = null;
  if (isEditing && params.investigacionPersonaData) {
    try {
      initialData = JSON.parse(
        params.investigacionPersonaData
      ) as DisplayInvestigacionPersonaFromList;
    } catch (e) {
      console.error("Error parsing investigacionPersonaData:", e);
    }
  }

  const [investigacionid, setInvestigacionid] = useState<number | undefined>(
    initialData?.investigacionid
  );
  const [personaid, setPersonaid] = useState<number | undefined>(
    initialData?.personaid
  );
  const [rol, setRol] = useState(initialData?.rol || "");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!investigacionid)
      errors.investigacionid = "El ID de Investigación es obligatorio.";
    if (!personaid) errors.personaid = "El ID de Persona es obligatorio.";
    if (!rol.trim()) errors.rol = "El Rol es obligatorio.";
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

    const payload: ApiInvestigacionPersona = {
      investigacionid: Number(investigacionid),
      personaid: Number(personaid),
      rol: rol.trim(),
    };

    try {
      let response;
      let responseData: ApiInvestigacionPersona;

      if (isEditing && initialData?.investigacionpersonaid) {
        response = await fetch(
          `http://localhost:8000/investigacionpersona/${initialData.investigacionpersonaid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch("http://localhost:8000/investigacionpersona", {
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
        pathname: "/investigacionpersona",
        params: isEditing
          ? { updatedInvestigacionPersona: JSON.stringify(responseData) }
          : { newInvestigacionPersona: JSON.stringify(responseData) },
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
          ID Investigación <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.investigacionid ? styles.inputError : null,
          ]}
          value={investigacionid?.toString() || ""}
          onChangeText={(text) =>
            setInvestigacionid(text ? parseInt(text) : undefined)
          }
          placeholder="ID de la Investigación"
          keyboardType="numeric"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.investigacionid && (
          <Text style={styles.fieldErrorText}>
            {fieldErrors.investigacionid}
          </Text>
        )}
      </View>

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
          Rol <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, fieldErrors.rol ? styles.inputError : null]}
          value={rol}
          onChangeText={setRol}
          placeholder="Ej. Investigador Principal"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.rol && (
          <Text style={styles.fieldErrorText}>{fieldErrors.rol}</Text>
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
