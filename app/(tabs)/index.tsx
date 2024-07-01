import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { Button, Input, Card } from "@rneui/themed";
import axios from "axios";

const TMDB_API_KEY = "8590bc85810dd2928e48928c254d5654"; // Reemplaza con tu clave API de TMDb

export default function Index() {
  const [recommendations, setRecommendations] = useState<
    { title: string; trailerUrl?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [movieData, setMovieData] = useState<any>(null);
  const [movieId, setMovieId] = useState<number | null>(null);
  const [seriesVideos, setSeriesVideos] = useState<
    { name: string; url: string }[]
  >([]);

  const fetchRecommendations = async (userId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/user_recommendations/${userId}`
      );
      setLoading(false);
      return response.data.recommendations.map((title: string) => ({ title }));
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "No se pudieron obtener las recomendaciones");
      console.error(error);
      return [];
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/load_data");
      if (
        response.data.message === "Data loaded successfully with Spark!" ||
        response.data.message === "Data has already been loaded"
      ) {
        Alert.alert("Éxito", "Datos cargados exitosamente");
        setDataLoaded(true);
      } else {
        Alert.alert("Información", "Los datos ya han sido cargados");
        setDataLoaded(true);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos");
      console.error(error);
    }
    setLoading(false);
  };

  const fetchMovieData = async (movieId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
      );
      setMovieData(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la información de la película");
      console.error(error);
    }
    setLoading(false);
  };

  const fetchSeriesVideos = async (seriesId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${seriesId}/videos?api_key=${TMDB_API_KEY}`
      );
      const videos = response.data.results.map((video: any) => ({
        name: video.name,
        url: `https://www.youtube.com/watch?v=${video.key}`,
      }));
      setSeriesVideos(videos);
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo obtener la información de los videos de la serie"
      );
      console.error(error);
    }
    setLoading(false);
  };

  const handleUserIdChange = (text: string) => {
    if (!dataLoaded) {
      Alert.alert(
        "Alerta",
        'Por favor, cargue los datos primero presionando el botón "Cargar Datos"'
      );
      return;
    }
    setUserId(Number(text));
  };

  const handleMovieIdChange = (text: string) => {
    setMovieId(Number(text));
  };

  const handleGetRecommendations = async () => {
    if (!dataLoaded) {
      Alert.alert(
        "Alerta",
        'Por favor, cargue los datos primero presionando el botón "Cargar Datos"'
      );
      return;
    }
    if (userId !== null) {
      const cachedRecommendations =
        recommendations.length > 0
          ? recommendations
          : await fetchRecommendations(userId);
      setRecommendations(cachedRecommendations);
    } else {
      Alert.alert("Alerta", "Por favor, ingrese un ID de usuario válido");
    }
  };

  const handleFetchSeriesVideos = async () => {
    if (movieId !== null) {
      await fetchSeriesVideos(movieId);
    } else {
      Alert.alert("Alerta", "Por favor, ingrese un ID de serie válido");
    }
  };

  const handleReset = () => {
    setRecommendations([]);
    setUserId(null);
    setMovieData(null);
    setMovieId(null);
    setSeriesVideos([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recomendaciones de Películas</Text>
      <Input
        placeholder="Ingrese el ID del Usuario"
        keyboardType="numeric"
        onChangeText={handleUserIdChange}
        containerStyle={styles.input}
        disabled={!dataLoaded}
        value={userId ? userId.toString() : ""}
      />
      <Button
        title="Cargar Datos"
        onPress={loadData}
        buttonStyle={styles.button}
        containerStyle={styles.buttonContainer}
        disabled={loading}
      />
      <Button
        title="Obtener Recomendaciones"
        onPress={handleGetRecommendations}
        buttonStyle={styles.button}
        containerStyle={styles.buttonContainer}
        disabled={loading || !dataLoaded}
      />
      <Input
        placeholder="Ingrese el ID de la Película"
        keyboardType="numeric"
        onChangeText={handleMovieIdChange}
        containerStyle={styles.input}
        value={movieId ? movieId.toString() : ""}
      />
      <Button
        title="Buscar Videos de la Película"
        onPress={handleFetchSeriesVideos}
        buttonStyle={styles.button}
        containerStyle={styles.buttonContainer}
        disabled={loading}
      />
      <Button
        title="Reiniciar"
        onPress={handleReset}
        buttonStyle={[styles.button, styles.resetButton]}
        containerStyle={styles.buttonContainer}
        disabled={loading}
      />
      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
        <>
          <FlatList
            data={recommendations}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Card containerStyle={styles.card}>
                <Text style={styles.itemTitle}>{item.title}</Text>
              </Card>
            )}
          />
          {movieData && (
            <Card containerStyle={styles.movieData}>
              <Card.Title style={styles.movieTitle}>
                {movieData.title}
              </Card.Title>
              <Card.Divider />
              <Text>{movieData.overview}</Text>
              <Text>Lanzamiento: {movieData.release_date}</Text>
              <Text>Calificación: {movieData.vote_average}</Text>
            </Card>
          )}
          {seriesVideos.length > 0 && (
            <View style={styles.seriesData}>
              <Text style={styles.sectionTitle}>Videos de la Película</Text>
              <FlatList
                data={seriesVideos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Card containerStyle={styles.card}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text
                      style={styles.link}
                      onPress={() => Linking.openURL(item.url)}
                    >
                      Ver Video
                    </Text>
                  </Card>
                )}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
  },
  buttonContainer: {
    width: "90%",
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: "#FF6347",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
  },
  loading: {
    fontSize: 18,
    color: "#333",
  },
  card: {
    width: "90%",
    marginBottom: 10,
  },
  movieData: {
    width: "90%",
    marginBottom: 20,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  seriesData: {
    width: "90%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  link: {
    color: "#007BFF",
    textDecorationLine: "underline",
    marginTop: 5,
  },
});
