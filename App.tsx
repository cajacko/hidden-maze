import React, {Component} from 'react';
import {
  StatusBar,
  Animated,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
  Easing,
} from 'react-native';
import styled from 'styled-components/native';

const avatarSize = 30;
const avatarBoundsSize = 120;

const avatarCenterOffset = avatarBoundsSize / 2 - avatarSize / 2;

const bounds = {
  x: {
    min: -avatarCenterOffset,
    max: avatarCenterOffset,
  },
  y: {
    min: -avatarCenterOffset,
    max: avatarCenterOffset,
  },
};

const Avatar = styled(Animated.View)`
  height: ${avatarSize}px;
  width: ${avatarSize}px;
  background-color: black;
  position: absolute;
  top: ${-avatarSize / 2}px;
  left: ${-avatarSize / 2}px;
`;

const AvatarCenter = styled.View`
  width: 1px;
  height: 1px;
  position: relative;
`;

const AvatarBounds = styled.View`
  width: ${avatarBoundsSize}px;
  height: ${avatarBoundsSize}px;
  position: relative;
  background-color: black;
  opacity: 0.2;
`;

const SafeAreaView = styled.SafeAreaView`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const tileSize = 800;

const Table = styled.View`
  height: ${tileSize}px;
  width: ${tileSize}px;
`;

const Row = styled.View`
  flex-direction: row;
  flex: 1;
`;

const Cell = styled.View`
  border: 1px solid black;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Text = styled.Text``;

const Map = styled(Animated.View)``;

const tiles = 10;

const Tile = ({x, y}: {x: number; y: number}) => {
  const rows = [];

  for (var i = 0; i < tiles; i++) {
    const row = [];

    for (var j = 0; j < tiles; j++) {
      row.push(`${x}.${i}-${y}.${j}`);
    }

    rows.push(row);
  }

  return (
    <Table>
      {rows.map((columns, i) => (
        <Row key={i}>
          {columns.map((text, j) => (
            <Cell key={j}>
              <Text>{text}</Text>
            </Cell>
          ))}
        </Row>
      ))}
    </Table>
  );
};

interface Props {}

class App extends Component<Props> {
  private panResponder: PanResponderInstance;
  private controller: Animated.ValueXY;
  private map: Animated.ValueXY;
  private default: {x: number; y: number};
  private reset: null | Animated.CompositeAnimation;
  private mapMotion: null | Animated.CompositeAnimation;
  private mapPosition: {x: number; y: number};
  private controllerPosition: {x: number; y: number};

  constructor(props: Props) {
    super(props);

    this.default = {x: 0, y: 0};

    this.mapPosition = {x: 0, y: 0};
    this.controllerPosition = {x: 0, y: 0};

    this.controller = new Animated.ValueXY(this.default);
    this.map = new Animated.ValueXY(this.mapPosition);

    const transformGesture = (
      event: GestureResponderEvent,
      gestureEvent: PanResponderGestureState,
    ) => {
      let x = gestureEvent.dx;
      let y = gestureEvent.dy;

      if (x > bounds.x.max) {
        x = bounds.x.max;
      } else if (x < bounds.x.min) {
        x = bounds.x.min;
      }

      if (y > bounds.y.max) {
        y = bounds.y.max;
      } else if (y < bounds.y.min) {
        y = bounds.y.min;
      }

      return {x, y};
    };

    this.reset = null;
    this.mapMotion = null;

    this.map.addListener(mapPosition => {
      this.mapPosition = mapPosition;
    });

    let id = 0;

    const moveMap = (velocityX: number, velocityY: number) => {
      id += 1;
      const moveId = id;

      if (this.mapMotion) {
        this.mapMotion.stop();
        this.mapMotion = null;
      }

      const loop = () => {
        if (moveId !== id) return;

        const mapMotion = Animated.timing(this.map, {
          duration: 500,
          easing: Easing.linear,
          toValue: {
            x: this.mapPosition.x - velocityX,
            y: this.mapPosition.y - velocityY,
          },
        });

        this.mapMotion = mapMotion;

        this.mapMotion.start(loop);
      };

      loop();
    };

    // moveMap(45, 45);

    const throttle = 100;

    setInterval(() => {
      if (this.controllerPosition.x === 0 && this.controllerPosition.y === 0) {
        if (this.mapMotion) this.mapMotion.stop();
        this.mapMotion = null;
        return;
      }

      moveMap(this.controllerPosition.x, this.controllerPosition.y);
    }, throttle);

    this.controller.addListener(({x, y}) => {
      this.controllerPosition = {x, y};
    });

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: () => {
        this.reset = Animated.spring(this.controller, {
          toValue: this.default,
          friction: 100,
        });

        this.reset.start(() => {
          this.reset = null;
        });
      },
      onPanResponderStart: () => {
        if (this.reset) {
          this.reset.stop();
          this.reset = null;
        }
      },
      onPanResponderMove: (event, gestureEvent) => {
        this.controller.setValue(transformGesture(event, gestureEvent));
      },
    });
  }

  render() {
    const avatarStyle = {
      transform: this.controller.getTranslateTransform(),
    };

    const mapStyle = {
      transform: this.map.getTranslateTransform(),
    };

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <Container {...this.panResponder.panHandlers} style={{zIndex: 3}}>
            <AvatarCenter>
              <Avatar style={[avatarStyle]} />
            </AvatarCenter>
          </Container>
          <Container style={{zIndex: 2}}>
            <AvatarBounds />
          </Container>
          <Container style={{zIndex: 1}}>
            <Map style={[mapStyle]}>
              <Tile x={0} y={0} />
            </Map>
          </Container>
        </SafeAreaView>
      </>
    );
  }
}

export default App;
