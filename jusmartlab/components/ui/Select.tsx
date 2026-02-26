import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Platform,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { JUColors, JURadius, JUShadow, JUSpacing } from '@/constants/theme';

interface Option {
    label: string;
    value: string | number;
}

interface SelectProps {
    label: string;
    value: string | number | null;
    placeholder?: string;
    options: Option[];
    onChange: (value: any) => void;
    icon?: keyof typeof Ionicons.glyphMap;
    disabled?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function Select({
    label,
    value,
    placeholder = 'Select an option',
    options,
    onChange,
    icon,
    disabled = false,
}: SelectProps) {
    const [visible, setVisible] = useState(false);
    const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const buttonRef = useRef<View>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const toggleDropdown = () => {
        if (disabled) return;
        if (visible) {
            setVisible(false);
        } else {
            buttonRef.current?.measureInWindow((x, y, width, height) => {
                setLayout({ x, y, width, height });
                setVisible(true);
            });
        }
    };

    const handleSelect = (val: string | number) => {
        onChange(val);
        setVisible(false);
    };

    // Close dropdown on page scroll (web) — but NOT on scroll inside the dropdown itself
    useEffect(() => {
        if (Platform.OS === 'web' && visible) {
            const handleScroll = (e: Event) => {
                // Don't close if scrolling inside the dropdown list
                const target = e.target as HTMLElement;
                if (target && target.closest && target.closest('[data-select-dropdown]')) return;
                setVisible(false);
            };
            window.addEventListener('scroll', handleScroll, true);
            return () => window.removeEventListener('scroll', handleScroll, true);
        }
    }, [visible]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                ref={buttonRef}
                style={[
                    styles.button,
                    disabled && styles.disabledButton,
                    visible && styles.buttonActive
                ]}
                onPress={toggleDropdown}
                activeOpacity={0.9}
            >
                <View style={styles.contentRow}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={selectedOption ? JUColors.primary : JUColors.textMuted}
                            style={styles.icon}
                        />
                    )}
                    <Text
                        style={[
                            styles.valueText,
                            !selectedOption && styles.placeholderText,
                        ]}
                        numberOfLines={1}
                    >
                        {selectedOption ? selectedOption.label : placeholder}
                    </Text>
                </View>
                <Ionicons
                    name={visible ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={visible ? JUColors.primary : JUColors.textMuted}
                />
            </TouchableOpacity>

            {/* Modal for Dropdown List */}
            <Modal visible={visible} transparent animationType="none">
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <AnimatedView
                        entering={ZoomIn.duration(200)}
                        exiting={FadeOut.duration(150)}
                        // @ts-ignore — web-only attribute for scroll detection
                        dataSet={{ selectDropdown: true }}
                        nativeID="select-dropdown"
                        style={[
                            styles.dropdown,
                            {
                                ...(Platform.OS === 'web' ? {
                                    top: layout.y + layout.height + 6,
                                    left: layout.x,
                                    width: layout.width,
                                } : {
                                    top: '30%',
                                    alignSelf: 'center',
                                    width: '80%',
                                    maxHeight: 400
                                })
                            },
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        {options.length > 0 ? (
                            <FlatList
                                data={options}
                                keyExtractor={(item) => String(item.value)}
                                showsVerticalScrollIndicator={true}
                                nestedScrollEnabled={true}
                                contentContainerStyle={{ paddingBottom: 8 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.option,
                                            item.value === value && styles.optionSelected,
                                        ]}
                                        onPress={() => handleSelect(item.value)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                item.value === value && styles.optionTextSelected,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        {item.value === value && (
                                            <Ionicons name="checkmark" size={18} color={JUColors.primary} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                style={styles.list}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No options available</Text>
                            </View>
                        )}
                    </AnimatedView>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: JUSpacing.lg,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: JUColors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: JUColors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: JURadius.md,
        paddingHorizontal: 16,
        paddingVertical: 14,
        ...(Platform.select({
            web: { transition: '0.2s all ease', outlineStyle: 'none', cursor: 'pointer' },
        }) as any),
    },
    buttonActive: {
        borderColor: JUColors.primary,
        ...Platform.select({
            web: { boxShadow: `0 0 0 3px ${JUColors.primary}30` }
        })
    },
    disabledButton: {
        backgroundColor: '#F8FAFC',
        opacity: 0.6,
        borderColor: '#E2E8F0',
        ...(Platform.select({
            web: { cursor: 'not-allowed' }
        }) as any)
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    icon: {
        width: 20,
        textAlign: 'center',
    },
    valueText: {
        fontSize: 15,
        color: JUColors.text,
        fontWeight: '500',
    },
    placeholderText: {
        color: '#94A3B8',
        fontWeight: '400',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: JURadius.md,
        ...JUShadow.lg,
        overflow: 'hidden',
        maxHeight: 320,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        zIndex: 1000,
    },
    list: { paddingVertical: 4 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        ...Platform.select({
            web: { transition: '0.1s background ease' }
        })
    },
    optionSelected: {
        backgroundColor: `${JUColors.primary}10`,
    },
    optionText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
    },
    optionTextSelected: {
        color: JUColors.primary,
        fontWeight: '700',
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: JUColors.textMuted,
        fontSize: 14,
    },
});
