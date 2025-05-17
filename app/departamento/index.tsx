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

interface ApiDepartamento {
  departamentoid: number;
  nombre: string;
}

interface DisplayDepartamento extends ApiDepartamento {
  id: string;
  displayName: string;
}

export default function DepartamentosListScreen() {
  const styles = getStyles();
  const router = useRouter();
  const params = useLocalSearchParams<{
    newDepartamento?: string;
    updatedDepartamento?: string;
  }>();

  const [departamentos, setDepartamentos] = useState<DisplayDepartamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:8000/departamento");
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
        }
        const data: ApiDepartamento[] = await response.json();

        const mappedDepartamentos: DisplayDepartamento[] = data.map((d) => ({
          ...d,
          id: String(d.departamentoid),
          displayName: d.nombre,
        }));
        setDepartamentos(mappedDepartamentos);
      } catch (e: any) {
        setError(e.message || "No se pudieron cargar los departamentos.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartamentos();
  }, []);

  useEffect(() => {
    if (params?.newDepartamento) {
      try {
        const nuevaApiDepartamento = JSON.parse(
          params.newDepartamento
        ) as ApiDepartamento;
        setDepartamentos((prev) => [
          ...prev,
          {
            ...nuevaApiDepartamento,
            id: String(nuevaApiDepartamento.departamentoid || Date.now()),
            displayName: nuevaApiDepartamento.nombre,
          },
        ]);
      } catch (e) {
        console.error("Error procesando nuevo departamento:", e);
      }
    } else if (params?.updatedDepartamento) {
      try {
        const departamentoActualizadoApi = JSON.parse(
          params.updatedDepartamento
        ) as ApiDepartamento;
        setDepartamentos((prev) =>
          prev.map((d_display) =>
            d_display.departamentoid ===
            departamentoActualizadoApi.departamentoid
              ? {
                  ...d_display,
                  ...departamentoActualizadoApi,
                  displayName: departamentoActualizadoApi.nombre,
                }
              : d_display
          )
        );
      } catch (e) {
        console.error("Error procesando departamento actualizado:", e);
      }
    }
  }, [params?.newDepartamento, params?.updatedDepartamento]);

  const handleDeleteDepartamento = async (departamentoIdToDelete: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/departamento/${departamentoIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorData}`);
      }
      setDepartamentos((prev) =>
        prev.filter((depto) => depto.departamentoid !== departamentoIdToDelete)
      );
    } catch (e) {
      Alert.alert("Error", "No se pudo eliminar el departamento.");
    }
  };

  const renderItem = ({ item }: { item: DisplayDepartamento }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.displayName}</Text>
      </View>
      <View style={styles.itemActions}>
        <Link
          href={{
            pathname: "/departamento/form",
            params: {
              departamentoId: item.departamentoid,
              departamentoData: JSON.stringify(item),
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
          onPress={() => handleDeleteDepartamento(item.departamentoid)}
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
        <Text>Cargando departamentos...</Text>
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

  if (departamentos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.itemTitle}>No hay departamentos registrados.</Text>
        <Link href="/departamento/form" asChild>
          <Pressable style={styles.addButton}>
            <IconSymbol
              name="plus.circle.fill"
              size={22}
              color={Colors.light.background}
            />
            <Text style={styles.addButtonText}>
              Agregar Primer Departamento
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/departamento/form" asChild>
        <Pressable style={styles.addButton}>
          <IconSymbol
            name="plus.circle.fill"
            size={22}
            color={Colors.light.background}
          />
          <Text style={styles.addButtonText}>Agregar Departamento</Text>
        </Pressable>
      </Link>
      <FlatList
        data={departamentos}
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
