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

interface ApiFacultad {
  facultadid?: number;
  nombre: string;
  siglas?: string;
  telefono?: string;
  correo?: string;
}

interface DisplayFacultadFromList extends ApiFacultad {
  id: string;
  displayName: string;
}

export default function FacultadFormScreen() {
  const styles = getStyles("light");
  const router = useRouter();
  const params = useLocalSearchParams<{
    facultadId?: string;
    facultadData?: string;
  }>();

  const isEditing = !!params.facultadId;
  let initialData: DisplayFacultadFromList | null = null;
  if (isEditing && params.facultadData) {
    try {
      initialData = JSON.parse(params.facultadData) as DisplayFacultadFromList;
    } catch (e) {
      console.error("Error parsing facultadData:", e);
    }
  }

  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [siglas, setSiglas] = useState(initialData?.siglas || "");
  const [telefono, setTelefono] = useState(initialData?.telefono || "");
  const [correo, setCorreo] = useState(initialData?.correo || "");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!nombre.trim()) errors.nombre = "El nombre es obligatorio.";
    if (correo.trim() && !/\S+@\S+\.\S+/.test(correo)) {
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

    const facultadPayload: ApiFacultad = {
      nombre: nombre.trim(),
      siglas: siglas?.trim() || undefined,
      telefono: telefono?.trim() || undefined,
      correo: correo?.trim() || undefined,
    };

    try {
      let response;
      let responseData: ApiFacultad;

      if (isEditing && initialData?.facultadid) {
        response = await fetch(
          `http://localhost:8000/facultades/${initialData.facultadid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(facultadPayload),
          }
        );
      } else {
        response = await fetch("http://localhost:8000/facultades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(facultadPayload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${
            errorText || "Error al guardar facultad"
          }`
        );
      }

      responseData = await response.json();

      router.replace({
        pathname: "/facultades",
        params: isEditing
          ? { updatedFacultad: JSON.stringify(responseData) }
          : { newFacultad: JSON.stringify(responseData) },
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
          Nombre <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, fieldErrors.nombre ? styles.inputError : null]}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Facultad de Ingeniería"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.nombre && (
          <Text style={styles.fieldErrorText}>{fieldErrors.nombre}</Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Siglas</Text>
        <TextInput
          style={styles.input}
          value={siglas}
          onChangeText={setSiglas}
          placeholder="Ej. FIUSAC"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej. 24189100"
          keyboardType="phone-pad"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={[styles.input, fieldErrors.correo ? styles.inputError : null]}
          value={correo}
          onChangeText={setCorreo}
          placeholder="ejemplo@facultad.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.correo && (
          <Text style={styles.fieldErrorText}>{fieldErrors.correo}</Text>
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
            : "Agregar Facultad"}
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
