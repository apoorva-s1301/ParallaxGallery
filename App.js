import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";

const { width, height } = Dimensions.get("screen");

const API_KEY = "563492ad6f91700001000001273fef4e6cc44bc3add21cfdbf6cf1a5";
const API_URL =
  "https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=40";

const fetchImages = async () => {
  const dataReceived = await fetch(API_URL, {
    headers: {
      Authorization: API_KEY,
    },
  });

  const { photos } = await dataReceived.json();
  return photos;
};

export default function App() {
  const [images, setImages] = useState(null);
  const [activeIndex, setActiveIndex] = useState();
  useEffect(() => {
    const fetchPictures = async () => {
      const images = await fetchImages();
      setImages(images);
    };
    fetchPictures();
  }, []);

  const topRef = useRef();
  const bottomRef = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index);
    topRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });
    if (index * 83 - 40 > width / 2) {
      bottomRef?.current?.scrollToOffset({
        offset: index * 83 - width / 2 + 40,
        animated: true,
      });
    } else {
      bottomRef?.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  if (!images) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="grey" />
      </View>
    );
  }
  // console.log(images);
  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={topRef}
        data={images}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          scrollToActiveIndex(
            Math.floor(event.nativeEvent.contentOffset.x / width)
          );
        }}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const translateX = scrollX.interpolate({
            inputRange,
            outputRange: [-width * 0.7, 0, width * 0.7],
          });
          return (
            <View style={{ width, alignItems: "center", paddingTop: 80 }}>
              <View
                style={{
                  borderRadius: 15,
                  padding: 8,
                  backgroundColor: "white",
                }}
              >
                <View
                  style={{
                    width: width * 0.8,
                    height: height * 0.7,
                    overflow: "hidden",
                    alignItems: "center",
                  }}
                >
                  <Animated.Image
                    source={{ uri: item.src.portrait }}
                    style={{
                      borderRadius: 15,
                      width: width * 1.4,
                      height: height,
                      resizeMode: "cover",
                      transform: [
                        {
                          translateX,
                        },
                      ],
                    }}
                  />
                </View>
              </View>
            </View>
          );
        }}
      />
      {/* <View /> */}
      <FlatList
        ref={bottomRef}
        data={images}
        keyExtractor={(item) => item.id.toString()}
        // vertical
        horizontal
        // showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // style={{ position: "absolute", right: 20, top: 40, bottom: 20 }}
        style={{ position: "absolute", bottom: 30 }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
              <Image
                source={{ uri: item.src.portrait }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 30,
                  margin: 3,
                  borderWidth: 2,
                  borderColor: activeIndex === index ? "white" : "transparent",
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
});
