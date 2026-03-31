import React from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppIcon from '../../components/AppIcon';
import { AdminPaginationControls } from '../../components/admin/AdminPaginationControls';
import { AdminScreenLayout } from '../../components/admin/AdminScreenLayout';
import { EmptyState } from '../../components/app/EmptyState';
import { PrimaryAction } from '../../components/app/PrimaryAction';
import {
  useAdminHotelsQuery,
  useArchiveAdminHotelMutation,
} from '../../features/admin/hooks';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AdminStackParamList } from '../../types/navigation';
import { formatCurrency } from '../../utils/format';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminHotels'>;

const hotelStatuses = ['active', 'archived', 'all'] as const;

export function AdminHotelsScreen({ navigation }: Props) {
  const showToast = useUIStore(state => state.showToast);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<(typeof hotelStatuses)[number]>('active');
  const query = useAdminHotelsQuery({ page, search, status }, true);
  const archiveMutation = useArchiveAdminHotelMutation();

  return (
    <AdminScreenLayout
      onBackPress={() => navigation.goBack()}
      rightAccessory={
        <Pressable onPress={() => navigation.navigate('AdminHotelEditor')}>
          <Text style={[typography.caption, { color: colors.primary }]}>Add</Text>
        </Pressable>
      }
      title="Hotel Management">
      <FlatList
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        data={query.data?.items || []}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message={
              query.isLoading
                ? 'Loading hotels...'
                : 'No hotels match the current filters.'
            }
            title="No hotels found"
          />
        }
        ListFooterComponent={
          query.data?.pagination ? (
            <AdminPaginationControls
              onNext={() => setPage(current => current + 1)}
              onPrevious={() => setPage(current => Math.max(current - 1, 1))}
              page={query.data.pagination.page}
              totalPages={query.data.pagination.totalPages}
            />
          ) : null
        }
        ListHeaderComponent={
          <View className="gap-4">
            <View className="rounded-[28px] bg-white p-5">
              <Text style={typography.title} className="text-brand-text">
                Hotels
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                Search, filter, create, and archive hotels from the mobile admin workspace.
              </Text>
              <View className="mt-4 rounded-[20px] bg-brand-surfaceMuted px-4 py-3">
                <TextInput
                  onChangeText={value => {
                    setSearch(value);
                    setPage(1);
                  }}
                  placeholder="Search by name, slug, city..."
                  placeholderTextColor={colors.textMuted}
                  style={[typography.body, { color: colors.textPrimary }]}
                  value={search}
                />
              </View>
              <View className="mt-4 flex-row flex-wrap gap-2">
                {hotelStatuses.map(item => {
                  const selected = status === item;
                  return (
                    <Pressable
                      className={`rounded-full px-4 py-2 ${selected ? 'bg-brand-primary' : 'bg-brand-surfaceMuted'}`}
                      key={item}
                      onPress={() => {
                        setStatus(item);
                        setPage(1);
                      }}>
                      <Text
                        style={[
                          typography.caption,
                          { color: selected ? '#FFFFFF' : colors.textPrimary },
                        ]}>
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <PrimaryAction
                label="Add hotel"
                onPress={() => navigation.navigate('AdminHotelEditor')}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="rounded-[28px] bg-white p-5">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text style={typography.title} className="text-brand-text">
                  {item.name}
                </Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: 6 }]}>
                  {item.location.area}, {item.location.city}, {item.location.country}
                </Text>
              </View>
              <View
                className={`rounded-full px-3 py-1.5 ${item.status === 'active' ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: item.status === 'active' ? colors.success : colors.textSecondary,
                    },
                  ]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 10 }]}>
              {item.shortDescription}
            </Text>

            <View className="mt-4 flex-row items-center justify-between">
              <Text style={typography.body} className="text-brand-text">
                {formatCurrency(item.pricing.nightlyRate, item.pricing.currency)} / night
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {item.slug}
              </Text>
            </View>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <PrimaryAction
                  label="Edit"
                  onPress={() =>
                    navigation.navigate('AdminHotelEditor', {
                      hotelId: item.id,
                    })
                  }
                  variant="secondary"
                />
              </View>
              <View className="flex-1">
                <PrimaryAction
                  disabled={archiveMutation.isPending || item.status === 'archived'}
                  label={item.status === 'archived' ? 'Archived' : 'Archive'}
                  onPress={async () => {
                    try {
                      await archiveMutation.mutateAsync(item.id);
                      showToast({
                        message: `${item.name} has been archived.`,
                        title: 'Hotel updated',
                        tone: 'success',
                      });
                    } catch (error) {
                      showToast({
                        message:
                          error instanceof Error
                            ? error.message
                            : 'Unable to archive hotel.',
                        title: 'Archive failed',
                        tone: 'error',
                      });
                    }
                  }}
                />
              </View>
            </View>
          </View>
        )}
        refreshing={query.isRefetching}
        showsVerticalScrollIndicator={false}
      />
    </AdminScreenLayout>
  );
}
