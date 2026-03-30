import React from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';

import AppIcon from '../AppIcon';
import { countries } from '../../data/countries';
import { colors } from '../../theme/colors';
import { CountryOption } from '../../types/auth';
import { typography } from '../../theme/typography';
import { DraggableSheet } from './DraggableSheet';

type Props = {
  onClose: () => void;
  onSelect: (country: CountryOption) => void;
  selectedCountry: CountryOption;
  visible: boolean;
};

export function CountrySelectorSheet({
  onClose,
  onSelect,
  selectedCountry,
  visible,
}: Props) {
  const [query, setQuery] = React.useState('');

  const filteredCountries = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return countries;
    }

    return countries.filter(country =>
      `${country.name} ${country.dialCode}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <DraggableSheet visible={visible} onClose={onClose} maxHeightRatio={0.56}>
      <View className="flex-1">
        <View className="mb-[18px] flex-row items-center justify-between">
          <Text
            style={[
              typography.heading,
              { fontSize: 16, lineHeight: 22, letterSpacing: 0 },
            ]}
            className="text-[#353535]">
            Country
          </Text>
          <Pressable onPress={onClose}>
            <AppIcon color="#313131" name="close" size={24} />
          </Pressable>
        </View>

        <View className="mb-[14px] h-[44px] flex-row items-center rounded-[22px] border border-[#383838] px-[16px]">
          <AppIcon color="#777777" name="magnify" size={18} />
          <TextInput
            placeholder="Search country"
            placeholderTextColor="#A9A9A9"
            style={[
              typography.body,
              {
                flex: 1,
                fontSize: 16,
                lineHeight: 20,
                color: '#2E2E2E',
                marginLeft: 10,
                paddingVertical: 0,
              },
            ]}
            value={query}
            onChangeText={setQuery}
          />
          {query ? (
            <Pressable
              onPress={() => setQuery('')}
              className="h-[21px] w-[21px] items-center justify-center rounded-full bg-[#3B3B3B]">
              <AppIcon color="#FFFFFF" name="close" size={12} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          bounces={false}
          keyboardShouldPersistTaps="handled"
          data={filteredCountries}
          keyExtractor={item => item.code}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const selected = item.code === selectedCountry.code;

            return (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                className="flex-row items-center border-b border-[#EFF1F4] py-[16px]">
                <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F6F1EA]">
                  <AppIcon color={colors.primaryDeep} name="flag-variant-outline" size={18} />
                </View>
                <Text
                  style={[typography.body, { fontSize: 16, lineHeight: 22 }]}
                  className="ml-[10px] flex-1 text-[#454545]">
                  ({item.dialCode}) {item.name}
                </Text>
                <View
                  className="h-[20px] w-[20px] items-center justify-center rounded-full border"
                  style={{
                    borderColor: selected ? colors.primary : '#D4D7DE',
                  }}>
                  {selected ? (
                    <View
                      className="h-[10px] w-[10px] rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                  ) : null}
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </DraggableSheet>
  );
}
