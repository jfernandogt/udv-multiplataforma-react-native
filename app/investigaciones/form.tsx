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
// Assuming Picker is needed for facultadid, if not, remove it.
// import { Picker } from '@react-native-picker/picker';

interface ApiInvestigacion {
  investigacionid?: number;
  facultadid: number;
  anio: number;
  titulo: string;
  duracion: number;
}

interface DisplayInvestigacionFromList extends ApiInvestigacion {
  id: string;
  displayName: string;
  facultad?: string; // Optional, based on GET all response
}

// Placeholder for Facultad data if you fetch it for a Picker
interface ApiFacultad {
  facultadid: number;
  nombre: string;
}

export default function InvestigacionFormScreen() {
  const styles = getStyles("light");
  const router = useRouter();
  const params = useLocalSearchParams<{
    investigacionId?: string;
    investigacionData?: string;
  }>();

  const isEditing = !!params.investigacionId;
  let initialData: DisplayInvestigacionFromList | null = null;
  if (isEditing && params.investigacionData) {
    try {
      initialData = JSON.parse(
        params.investigacionData
      ) as DisplayInvestigacionFromList;
    } catch (e) {
      console.error("Error parsing investigacionData:", e);
    }
  }

  const [titulo, setTitulo] = useState(initialData?.titulo || "");
  const [facultadid, setFacultadid] = useState<number | undefined>(
    initialData?.facultadid
  );
  const [anio, setAnio] = useState<string>(initialData?.anio?.toString() || "");
  const [duracion, setDuracion] = useState<string>(
    initialData?.duracion?.toString() || ""
  );

  // Placeholder for facultades list for Picker
  // const [facultades, setFacultades] = useState<ApiFacultad[]>([]);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // useEffect(() => {
  //   const fetchFacultades = async () => {
  //     try {
  //       const response = await fetch("http://localhost:8000/facultades");
  //       if (!response.ok) throw new Error("Failed to fetch facultades");
  //       const data: ApiFacultad[] = await response.json();
  //       setFacultades(data);
  //       if (data.length > 0 && !facultadid) {
  //         // Optionally set a default facultad if not editing or no initialData
  //         // setFacultadid(data[0].facultadid);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching facultades:", error);
  //       // Handle error fetching facultades, maybe set an error state
  //     }
  //   };
  //   fetchFacultades();
  // }, []);

  const validateFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!titulo.trim()) errors.titulo = "El título es obligatorio.";
    if (!facultadid) errors.facultadid = "La facultad es obligatoria.";
    if (!anio.trim()) errors.anio = "El año es obligatorio.";
    if (isNaN(parseInt(anio))) errors.anio = "El año debe ser un número.";
    if (!duracion.trim()) errors.duracion = "La duración es obligatoria.";
    if (isNaN(parseInt(duracion)))
      errors.duracion = "La duración debe ser un número.";

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

    const investigacionPayload: ApiInvestigacion = {
      titulo: titulo.trim(),
      facultadid: Number(facultadid),
      anio: parseInt(anio),
      duracion: parseInt(duracion),
    };

    try {
      let response;
      let responseData: ApiInvestigacion;

      if (isEditing && initialData?.investigacionid) {
        response = await fetch(
          `http://localhost:8000/investigaciones/${initialData.investigacionid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(investigacionPayload),
          }
        );
      } else {
        response = await fetch("http://localhost:8000/investigaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(investigacionPayload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${
            errorText || "Error al guardar investigación"
          }`
        );
      }

      responseData = await response.json();

      router.replace({
        pathname: "/investigaciones",
        params: isEditing
          ? { updatedInvestigacion: JSON.stringify(responseData) }
          : { newInvestigacion: JSON.stringify(responseData) },
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
          Título <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, fieldErrors.titulo ? styles.inputError : null]}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej. Desarrollo de IA"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.titulo && (
          <Text style={styles.fieldErrorText}>{fieldErrors.titulo}</Text>
        )}
      </View>

      {/* Replace TextInput with Picker for Facultad ID if using Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          ID Facultad <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.facultadid ? styles.inputError : null,
          ]}
          value={facultadid?.toString() || ""}
          onChangeText={(text) =>
            setFacultadid(text ? parseInt(text) : undefined)
          }
          placeholder="ID de la Facultad"
          keyboardType="numeric"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.facultadid && (
          <Text style={styles.fieldErrorText}>{fieldErrors.facultadid}</Text>
        )}
      </View>
      {/* Example Picker - uncomment and adapt if needed
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Facultad <Text style={styles.requiredIndicator}>*</Text></Text>
        <View style={[styles.input, styles.pickerContainer, fieldErrors.facultadid ? styles.inputError : null]}>
          <Picker
            selectedValue={facultadid}
            onValueChange={(itemValue) => setFacultadid(itemValue)}
            style={styles.picker}
            enabled={!loading && facultades.length > 0}
          >
            <Picker.Item label="Seleccione una facultad..." value={undefined} />
            {facultades.map((fac) => (
              <Picker.Item key={fac.facultadid} label={fac.nombre} value={fac.facultadid} />
            ))}
          </Picker>
        </View>
        {fieldErrors.facultadid && (
          <Text style={styles.fieldErrorText}>{fieldErrors.facultadid}</Text>
        )}
      </View>
      */}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Año <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, fieldErrors.anio ? styles.inputError : null]}
          value={anio}
          onChangeText={setAnio}
          placeholder="Ej. 2024"
          keyboardType="numeric"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.anio && (
          <Text style={styles.fieldErrorText}>{fieldErrors.anio}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Duración (meses) <Text style={styles.requiredIndicator}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.duracion ? styles.inputError : null,
          ]}
          value={duracion}
          onChangeText={setDuracion}
          placeholder="Ej. 12"
          keyboardType="numeric"
          placeholderTextColor={Colors.light.placeholder}
          editable={!loading}
        />
        {fieldErrors.duracion && (
          <Text style={styles.fieldErrorText}>{fieldErrors.duracion}</Text>
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
            : "Agregar Investigación"}
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
    pickerContainer: {
      // Styles for Picker container if used
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: "center",
    },
    picker: {
      // Styles for Picker itself if used
      height: Platform.OS === "ios" ? undefined : 50, // iOS Picker height is intrinsic
      width: "100%",
      color: Colors[colorScheme].text,
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
