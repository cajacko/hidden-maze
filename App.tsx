import React, {Component} from 'react';
import {
  StatusBar,
  Animated,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
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
  background-color: #fafafa;
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

interface Props {}

class App extends Component<Props> {
  private panResponder: PanResponderInstance;
  private pan: Animated.ValueXY;
  private default: {x: number; y: number};
  private reset: null | Animated.CompositeAnimation;

  constructor(props: Props) {
    super(props);

    this.default = {x: 0, y: 0};

    this.pan = new Animated.ValueXY(this.default);

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

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: () => {
        this.reset = Animated.spring(this.pan, {
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
        this.pan.setValue(transformGesture(event, gestureEvent));
      },
    });
  }

  render() {
    const panStyle = {
      transform: this.pan.getTranslateTransform(),
    };

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <Container {...this.panResponder.panHandlers} style={{zIndex: 2}}>
            <AvatarCenter>
              <Avatar style={[panStyle]} />
            </AvatarCenter>
          </Container>
          <Container style={{zIndex: 1}}>
            <AvatarBounds />
          </Container>
        </SafeAreaView>
      </>
    );
  }
}

export default App;
