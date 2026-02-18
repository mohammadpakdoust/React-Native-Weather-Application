// Animated background based on weather conditions
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';

interface AnimatedBackgroundProps {
    type: 'clear' | 'cloudy' | 'rain' | 'snow';
}

const { width, height } = Dimensions.get('window');

export function AnimatedBackground({ type }: AnimatedBackgroundProps) {
    const getBackgroundGradient = () => {
        switch (type) {
            case 'clear':
                return ['#1e3a8a', '#3b82f6', '#60a5fa'];
            case 'cloudy':
                return ['#475569', '#64748b', '#94a3b8'];
            case 'rain':
                return ['#1e293b', '#334155', '#475569'];
            case 'snow':
                return ['#334155', '#475569', '#64748b'];
            default:
                return ['#1e3a8a', '#3b82f6', '#60a5fa'];
        }
    };

    const colors = getBackgroundGradient();

    return (
        <View style={styles.container}>
            <View style={[styles.gradient, { backgroundColor: colors[0] }]} />
            <View
                style={[
                    styles.gradient,
                    { backgroundColor: colors[1], opacity: 0.7 },
                ]}
            />
            <View
                style={[
                    styles.gradient,
                    { backgroundColor: colors[2], opacity: 0.5 },
                ]}
            />

            {type === 'rain' && <RainAnimation />}
            {type === 'snow' && <SnowAnimation />}
            {type === 'clear' && <SunGlowAnimation />}
            {type === 'cloudy' && <CloudAnimation />}
        </View>
    );
}

function RainAnimation() {
    const drops = Array.from({ length: 30 }, (_, i) => i);

    return (
        <View style={styles.particleContainer}>
            {drops.map((i) => (
                <RainDrop key={i} delay={i * 100} />
            ))}
        </View>
    );
}

function RainDrop({ delay }: { delay: number }) {
    const translateY = useSharedValue(-50);
    const left = Math.random() * width;

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-50, { duration: 0 }),
                withTiming(height + 50, {
                    duration: 1000 + Math.random() * 500,
                    easing: Easing.linear,
                })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.rainDrop,
                { left },
                animatedStyle,
            ]}
        />
    );
}

function SnowAnimation() {
    const flakes = Array.from({ length: 20 }, (_, i) => i);

    return (
        <View style={styles.particleContainer}>
            {flakes.map((i) => (
                <Snowflake key={i} delay={i * 150} />
            ))}
        </View>
    );
}

function Snowflake({ delay }: { delay: number }) {
    const translateY = useSharedValue(-20);
    const translateX = useSharedValue(0);
    const left = Math.random() * width;

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 0 }),
                withTiming(height + 20, {
                    duration: 3000 + Math.random() * 2000,
                    easing: Easing.linear,
                })
            ),
            -1,
            false
        );

        translateX.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(10, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
        ],
    }));

    return (
        <Animated.View
            style={[
                styles.snowflake,
                { left },
                animatedStyle,
            ]}
        />
    );
}

function SunGlowAnimation() {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        opacity.value = withRepeat(
            withSequence(
                withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.sunGlow, animatedStyle]} />
    );
}

function CloudAnimation() {
    const clouds = Array.from({ length: 3 }, (_, i) => i);

    return (
        <View style={styles.particleContainer}>
            {clouds.map((i) => (
                <Cloud key={i} delay={i * 2000} top={50 + i * 80} />
            ))}
        </View>
    );
}

function Cloud({ delay, top }: { delay: number; top: number }) {
    const translateX = useSharedValue(-100);

    useEffect(() => {
        translateX.value = withRepeat(
            withSequence(
                withTiming(-100, { duration: 0 }),
                withTiming(width + 100, {
                    duration: 15000,
                    easing: Easing.linear,
                })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.cloud,
                { top },
                animatedStyle,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    particleContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    rainDrop: {
        position: 'absolute',
        width: 2,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 1,
    },
    snowflake: {
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 4,
    },
    sunGlow: {
        position: 'absolute',
        top: 100,
        right: 40,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    cloud: {
        position: 'absolute',
        width: 120,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
});
