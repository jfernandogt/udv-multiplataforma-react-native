import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ApiTitulo {
  tituloid: number;
  personaid: number;
  carreraid: number;
  fechagraduacion: string; // ISO date string
  nombres?: string;
  apellidos?: string;
  carrera?: string;
}

interface DisplayTitulo extends ApiTitulo {
  id: string;
  displayName: string;
  formattedFechaGraduacion: string;
}

export default function TitulosListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newTitulo?: string;
    updatedTitulo?: string;
  }>();

  const [titulos, setTitulos] = useState<DisplayTitulo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString();
    } catch {
      return "Fecha inválida";
    }
  };

  useEffect(() => {
    const fetchTitulos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/titulo");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiTitulo[] = await response.json();

        const mappedTitulos: DisplayTitulo[] = data.map((t) => ({
          ...t,
          id: String(t.tituloid),
          displayName: `${t.nombres || "N/A"} ${t.apellidos || "N/A"} - ${
            t.carrera || "N/A"
          }`,
          formattedFechaGraduacion: formatDate(t.fechagraduacion),
        }));
        setTitulos(mappedTitulos);
      } catch (e: any) {
        setError(e.message || "No se pudieron cargar los títulos.");
      } finally {
        setLoading(false);
      }
    };

    fetchTitulos();
  }, []);

  useEffect(() => {
    if (params?.newTitulo) {
      try {
        const nuevaApiTitulo = JSON.parse(params.newTitulo) as ApiTitulo;
        setTitulos((prev) => [
          ...prev,
          {
            ...nuevaApiTitulo,
            id: String(nuevaApiTitulo.tituloid || Date.now()),
            displayName: `ID Persona: ${nuevaApiTitulo.personaid} - ID Carrera: ${nuevaApiTitulo.carreraid}`,
            formattedFechaGraduacion: formatDate(
              nuevaApiTitulo.fechagraduacion
            ),
          },
        ]);
      } catch (e) {
        console.error("Error procesando nuevo título:", e);
      }
    } else if (params?.updatedTitulo) {
      try {
        const tituloActualizadoApi = JSON.parse(
          params.updatedTitulo
        ) as ApiTitulo;
        setTitulos((prev) =>
          prev.map((t_display) =>
            t_display.tituloid === tituloActualizadoApi.tituloid
              ? {
                  ...t_display,
                  ...tituloActualizadoApi,
                  displayName: `${
                    tituloActualizadoApi.nombres || t_display.nombres || "N/A"
                  } ${
                    tituloActualizadoApi.apellidos ||
                    t_display.apellidos ||
                    "N/A"
                  } - ${
                    tituloActualizadoApi.carrera || t_display.carrera || "N/A"
                  }`,
                  formattedFechaGraduacion: formatDate(
                    tituloActualizadoApi.fechagraduacion
                  ),
                }
              : t_display
          )
        );
      } catch (e) {
        console.error("Error procesando título actualizado:", e);
      }
    }
  }, [params?.newTitulo, params?.updatedTitulo]);

  const handleDeleteTitulo = async (idToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/titulo/${idToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setTitulos((prev) => prev.filter((t) => t.tituloid !== idToDelete));
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar el título.");
    }
  };

  const renderItem = ({ item }: { item: DisplayTitulo }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
        <Text style={styles.itemSubtitle}>
          Graduación: {item.formattedFechaGraduacion}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/titulo/form",
            params: {
              tituloId: item.tituloid,
              tituloData: JSON.stringify(item),
            },
          }}
          asChild
        >
          <Pressable style={{ ...styles.actionButton, ...styles.editButton }}>
            <IconSymbol
              name="pencil"
              size={18}
              color={Colors.light.background}
            />
          </Pressable>
        </Link>
        <Pressable
          style={{ ...styles.actionButton, ...styles.deleteButton }}
          onPress={() => handleDeleteTitulo(item.tituloid)}
        >
          <IconSymbol name="trash" size={18} color={Colors.light.background} />
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text>Cargando títulos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (titulos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>No hay títulos registrados.</Text>
        <Link href="/titulo/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>Agregar Primer Título</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/titulo/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Título</Text>
        </Pressable>
      </Link>
      <FlatList
        data={titulos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: Colors.light.background,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      backgroundColor: Colors.light.background,
    },
    errorText: {
      color: Colors.light.error,
      fontSize: 16,
      marginBottom: 10,
      textAlign: "center",
    },
    addButton: {
      backgroundColor: Colors.light.tint,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    addButtonText: {
      color: Colors.light.background,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    listContent: {
      paddingBottom: 20,
    },
    itemContainer: {
      backgroundColor: Colors.light.card,
      padding: 15,
      borderRadius: 8,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    itemTextContainer: {
      flex: 1,
      marginRight: 8,
    },
    itemTitle: {
      fontSize: 17,
      fontWeight: "bold",
      color: Colors.light.text,
    },
    itemSubtitle: {
      fontSize: 14,
      color: Colors.light.textMuted,
      marginTop: 2,
    },
    itemActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: 8,
      borderRadius: 20,
      marginLeft: 8,
    },
    editButton: {
      backgroundColor: Colors.light.tint,
    },
    deleteButton: {
      backgroundColor: Colors.light.error,
    },
  });
