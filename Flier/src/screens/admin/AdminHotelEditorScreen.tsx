import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppIcon from '../../components/AppIcon';
import { AdminScreenLayout } from '../../components/admin/AdminScreenLayout';
import { PrimaryAction } from '../../components/app/PrimaryAction';
import { AuthTextField } from '../../components/auth/AuthTextField';
import {
  useAdminHotelQuery,
  useCreateAdminHotelMutation,
  useUpdateAdminHotelMutation,
  uploadHotelImagesToCloudinary,
} from '../../features/admin/hooks';
import {
  createEmptyAdminHotelPayload,
  createEmptyRoomType,
  joinCommaSeparated,
  slugifyAdminLabel,
  splitCommaSeparated,
} from '../../features/admin/form';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AdminHotelPayload } from '../../types/admin';
import { AdminStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminHotelEditor'>;

const statusOptions: AdminHotelPayload['status'][] = ['active', 'archived'];

export function AdminHotelEditorScreen({ navigation, route }: Props) {
  const hotelId = route.params?.hotelId;
  const showToast = useUIStore(state => state.showToast);
  const hotelQuery = useAdminHotelQuery(hotelId || '', Boolean(hotelId));
  const createMutation = useCreateAdminHotelMutation();
  const updateMutation = useUpdateAdminHotelMutation(hotelId || '');
  const [draft, setDraft] = React.useState<AdminHotelPayload>(createEmptyAdminHotelPayload());
  const [isUploadingImages, setIsUploadingImages] = React.useState(false);

  React.useEffect(() => {
    if (!hotelQuery.data) {
      return;
    }

    const { createdAt, id, updatedAt, ...payload } = hotelQuery.data;
    setDraft({
      ...payload,
      roomTypes: payload.roomTypes.length ? payload.roomTypes : [createEmptyRoomType()],
      tag: payload.tag || '',
    });
  }, [hotelQuery.data]);

  const updateDraft = React.useCallback(
    <K extends keyof AdminHotelPayload>(key: K, value: AdminHotelPayload[K]) => {
      setDraft(current => ({
        ...current,
        [key]: value,
      }));
    },
    [],
  );

  const updateRoomType = React.useCallback(
    (index: number, value: AdminHotelPayload['roomTypes'][number]) => {
      setDraft(current => ({
        ...current,
        roomTypes: current.roomTypes.map((roomType, roomTypeIndex) =>
          roomTypeIndex === index ? value : roomType,
        ),
      }));
    },
    [],
  );

  const saveHotel = React.useCallback(async () => {
    try {
      const payload: AdminHotelPayload = {
        ...draft,
        roomTypes: draft.roomTypes.filter(roomType => roomType.name.trim()),
        slug: draft.slug.trim() || slugifyAdminLabel(draft.name),
        tag: draft.tag?.trim() || null,
      };

      if (hotelId) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      showToast({
        message: `${payload.name} is ready in the admin catalog.`,
        title: hotelId ? 'Hotel updated' : 'Hotel created',
        tone: 'success',
      });
      navigation.goBack();
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : 'Unable to save hotel.',
        title: 'Save failed',
        tone: 'error',
      });
    }
  }, [createMutation, draft, hotelId, navigation, showToast, updateMutation]);

  return (
    <AdminScreenLayout
      onBackPress={() => navigation.goBack()}
      title={hotelId ? 'Edit Hotel' : 'Create Hotel'}>
      <ScrollView
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Basics
          </Text>
          <View className="mt-4">
            <AuthTextField
              label="Hotel name"
              onChangeText={value => updateDraft('name', value)}
              placeholder="The Golden Harbor"
              value={draft.name}
            />
            <AuthTextField
              label="Slug"
              onChangeText={value => updateDraft('slug', value)}
              placeholder="golden-harbor"
              value={draft.slug}
            />
            <AuthTextField
              label="Tag"
              onChangeText={value => updateDraft('tag', value)}
              placeholder="Luxury"
              value={draft.tag || ''}
            />
            <AuthTextField
              label="Short description"
              onChangeText={value => updateDraft('shortDescription', value)}
              placeholder="Sea-facing luxury suites with a rooftop pool."
              value={draft.shortDescription}
            />
            <AuthTextField
              label="Full description"
              multiline
              onChangeText={value => updateDraft('description', value)}
              placeholder="Describe the stay experience, amenities, and atmosphere."
              style={{ minHeight: 96, textAlignVertical: 'top' }}
              value={draft.description}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Nightly rate"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  pricing: {
                    ...current.pricing,
                    nightlyRate: Number(value) || 0,
                  },
                }))
              }
              placeholder="220"
              value={`${draft.pricing.nightlyRate}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Rating"
              onChangeText={value => updateDraft('rating', Number(value) || 0)}
              placeholder="4.7"
              value={`${draft.rating}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Review count"
              onChangeText={value => updateDraft('reviewCount', Number(value) || 0)}
              placeholder="120"
              value={`${draft.reviewCount}`}
            />
          </View>
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Location
          </Text>
          <View className="mt-4">
            <AuthTextField
              label="Address"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  location: {
                    ...current.location,
                    address: value,
                  },
                }))
              }
              placeholder="198 Harbor Avenue"
              value={draft.location.address}
            />
            <AuthTextField
              label="Area"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  location: {
                    ...current.location,
                    area: value,
                  },
                }))
              }
              placeholder="Downtown"
              value={draft.location.area}
            />
            <AuthTextField
              label="City"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  location: {
                    ...current.location,
                    city: value,
                  },
                }))
              }
              placeholder="Singapore"
              value={draft.location.city}
            />
            <AuthTextField
              label="Country"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  location: {
                    ...current.location,
                    country: value,
                  },
                }))
              }
              placeholder="Singapore"
              value={draft.location.country}
            />
            <AuthTextField
              label="Destination ID"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  location: {
                    ...current.location,
                    destinationId: value,
                  },
                }))
              }
              placeholder="singapore-downtown"
              value={draft.location.destinationId}
            />
          </View>
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Inventory and policies
          </Text>
          <View className="mt-4">
            <AuthTextField
              keyboardType="numeric"
              label="Rooms"
              onChangeText={value => updateDraft('rooms', Number(value) || 0)}
              placeholder="12"
              value={`${draft.rooms}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Available rooms"
              onChangeText={value => updateDraft('availableRooms', Number(value) || 0)}
              placeholder="8"
              value={`${draft.availableRooms}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Baths"
              onChangeText={value => updateDraft('baths', Number(value) || 0)}
              placeholder="1"
              value={`${draft.baths}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Max guests"
              onChangeText={value => updateDraft('maxGuests', Number(value) || 0)}
              placeholder="4"
              value={`${draft.maxGuests}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Square meters"
              onChangeText={value => updateDraft('squareMeters', Number(value) || 0)}
              placeholder="42"
              value={`${draft.squareMeters}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Cancellation window hours"
              onChangeText={value =>
                updateDraft('cancellationWindowHours', Number(value) || 0)
              }
              placeholder="48"
              value={`${draft.cancellationWindowHours}`}
            />
            <AuthTextField
              label="Amenities"
              onChangeText={value => updateDraft('amenities', splitCommaSeparated(value))}
              placeholder="Wifi, Pool, Spa"
              value={joinCommaSeparated(draft.amenities)}
            />
            <AuthTextField
              label="House rules"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  policies: {
                    ...current.policies,
                    houseRules: splitCommaSeparated(value),
                  },
                }))
              }
              placeholder="No smoking, No parties"
              value={joinCommaSeparated(draft.policies.houseRules)}
            />
            <AuthTextField
              label="Cancellation policy"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  policies: {
                    ...current.policies,
                    cancellation: value,
                  },
                }))
              }
              placeholder="Free cancellation up to 48 hours before check-in."
              value={draft.policies.cancellation}
            />
            <AuthTextField
              label="Check-in from"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  policies: {
                    ...current.policies,
                    checkInFrom: value,
                  },
                }))
              }
              placeholder="14:00"
              value={draft.policies.checkInFrom}
            />
            <AuthTextField
              label="Check-out until"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  policies: {
                    ...current.policies,
                    checkOutUntil: value,
                  },
                }))
              }
              placeholder="11:00"
              value={draft.policies.checkOutUntil}
            />
          </View>
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Pricing details
          </Text>
          <View className="mt-4">
            <AuthTextField
              label="Currency"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  pricing: {
                    ...current.pricing,
                    currency: value.toUpperCase(),
                  },
                }))
              }
              placeholder="USD"
              value={draft.pricing.currency}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Cleaning fee"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  pricing: {
                    ...current.pricing,
                    cleaningFee: Number(value) || 0,
                  },
                }))
              }
              placeholder="15"
              value={`${draft.pricing.cleaningFee}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Service fee"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  pricing: {
                    ...current.pricing,
                    serviceFee: Number(value) || 0,
                  },
                }))
              }
              placeholder="20"
              value={`${draft.pricing.serviceFee}`}
            />
            <AuthTextField
              keyboardType="numeric"
              label="Tax rate"
              onChangeText={value =>
                setDraft(current => ({
                  ...current,
                  pricing: {
                    ...current.pricing,
                    taxRate: Number(value) || 0,
                  },
                }))
              }
              placeholder="0.1"
              value={`${draft.pricing.taxRate}`}
            />
          </View>
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Images
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
            Upload hotel photos directly from your device. The returned secure URLs are saved in the database.
          </Text>
          <PrimaryAction
            disabled={isUploadingImages}
            label={isUploadingImages ? 'Uploading photos...' : 'Upload photos'}
            onPress={async () => {
              try {
                setIsUploadingImages(true);
                const uploadedImages = await uploadHotelImagesToCloudinary();

                if (!uploadedImages.length) {
                  return;
                }

                setDraft(current => ({
                  ...current,
                  images: [...current.images, ...uploadedImages],
                }));
                showToast({
                  message: `${uploadedImages.length} image(s) uploaded.`,
                  title: 'Photos ready',
                  tone: 'success',
                });
              } catch (error) {
                showToast({
                  message:
                    error instanceof Error
                      ? error.message
                      : 'Unable to upload hotel images.',
                  title: 'Upload failed',
                  tone: 'error',
                });
              } finally {
                setIsUploadingImages(false);
              }
            }}
            style={{ marginTop: 16 }}
          />

          {draft.images.length ? (
            <View className="mt-4 flex-row flex-wrap gap-3">
              {draft.images.map(image => (
                <View key={image}>
                  <Image
                    source={{ uri: image }}
                    style={{ borderRadius: 18, height: 88, width: 88 }}
                  />
                  <Pressable
                    className="absolute right-1 top-1 h-7 w-7 items-center justify-center rounded-full bg-black/55"
                    onPress={() =>
                      setDraft(current => ({
                        ...current,
                        images: current.images.filter(item => item !== image),
                      }))
                    }>
                    <AppIcon color="#FFFFFF" name="close" size={16} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Room types
          </Text>
          <View className="mt-4 gap-4">
            {draft.roomTypes.map((roomType, index) => (
              <View className="rounded-[24px] bg-brand-surfaceMuted p-4" key={`${roomType.code}-${index}`}>
                <View className="flex-row items-center justify-between">
                  <Text style={typography.title} className="text-brand-text">
                    Room Type {index + 1}
                  </Text>
                  {draft.roomTypes.length > 1 ? (
                    <Pressable
                      onPress={() =>
                        setDraft(current => ({
                          ...current,
                          roomTypes: current.roomTypes.filter((_, roomTypeIndex) => roomTypeIndex !== index),
                        }))
                      }>
                      <AppIcon color={colors.error} name="close" size={22} />
                    </Pressable>
                  ) : null}
                </View>
                <View className="mt-3">
                  <AuthTextField
                    label="Name"
                    onChangeText={value => updateRoomType(index, { ...roomType, name: value })}
                    placeholder="Ocean Suite"
                    value={roomType.name}
                  />
                  <AuthTextField
                    label="Code"
                    onChangeText={value => updateRoomType(index, { ...roomType, code: value })}
                    placeholder="ocean-suite"
                    value={roomType.code}
                  />
                  <AuthTextField
                    label="Description"
                    onChangeText={value =>
                      updateRoomType(index, { ...roomType, description: value })
                    }
                    placeholder="Premium suite with sea view."
                    value={roomType.description}
                  />
                  <AuthTextField
                    label="Amenities"
                    onChangeText={value =>
                      updateRoomType(index, {
                        ...roomType,
                        amenities: splitCommaSeparated(value),
                      })
                    }
                    placeholder="Wifi, King bed, Balcony"
                    value={joinCommaSeparated(roomType.amenities)}
                  />
                  <AuthTextField
                    label="Image URL"
                    onChangeText={value => updateRoomType(index, { ...roomType, image: value })}
                    placeholder="Use one of the uploaded image URLs"
                    value={roomType.image || ''}
                  />
                  <AuthTextField
                    keyboardType="numeric"
                    label="Beds"
                    onChangeText={value =>
                      updateRoomType(index, { ...roomType, beds: Number(value) || 0 })
                    }
                    placeholder="1"
                    value={`${roomType.beds}`}
                  />
                  <AuthTextField
                    keyboardType="numeric"
                    label="Available units"
                    onChangeText={value =>
                      updateRoomType(index, {
                        ...roomType,
                        availableUnits: Number(value) || 0,
                      })
                    }
                    placeholder="4"
                    value={`${roomType.availableUnits}`}
                  />
                  <AuthTextField
                    keyboardType="numeric"
                    label="Max guests"
                    onChangeText={value =>
                      updateRoomType(index, {
                        ...roomType,
                        maxGuests: Number(value) || 0,
                      })
                    }
                    placeholder="2"
                    value={`${roomType.maxGuests}`}
                  />
                  <AuthTextField
                    keyboardType="numeric"
                    label="Nightly rate"
                    onChangeText={value =>
                      updateRoomType(index, {
                        ...roomType,
                        nightlyRate: Number(value) || 0,
                      })
                    }
                    placeholder="280"
                    value={`${roomType.nightlyRate}`}
                  />
                </View>
              </View>
            ))}
          </View>
          <PrimaryAction
            label="Add room type"
            onPress={() =>
              setDraft(current => ({
                ...current,
                roomTypes: [...current.roomTypes, createEmptyRoomType()],
              }))
            }
            style={{ marginTop: 16 }}
            variant="secondary"
          />
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Visibility
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {statusOptions.map(option => {
              const selected = draft.status === option;
              return (
                <Pressable
                  className={`rounded-full px-4 py-2 ${selected ? 'bg-brand-primary' : 'bg-brand-surfaceMuted'}`}
                  key={option}
                  onPress={() => updateDraft('status', option)}>
                  <Text
                    style={[
                      typography.caption,
                      { color: selected ? '#FFFFFF' : colors.textPrimary },
                    ]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View className="mt-4 flex-row gap-3">
            <Pressable
              className={`flex-1 rounded-[18px] px-4 py-4 ${draft.featured ? 'bg-brand-primary' : 'bg-brand-surfaceMuted'}`}
              onPress={() => updateDraft('featured', !draft.featured)}>
              <Text
                style={[
                  typography.caption,
                  { color: draft.featured ? '#FFFFFF' : colors.textPrimary },
                ]}>
                Featured hotel
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-[18px] px-4 py-4 ${draft.featuredDestination ? 'bg-brand-primary' : 'bg-brand-surfaceMuted'}`}
              onPress={() => updateDraft('featuredDestination', !draft.featuredDestination)}>
              <Text
                style={[
                  typography.caption,
                  { color: draft.featuredDestination ? '#FFFFFF' : colors.textPrimary },
                ]}>
                Featured destination
              </Text>
            </Pressable>
          </View>
        </View>

        <PrimaryAction
          disabled={
            createMutation.isPending ||
            updateMutation.isPending ||
            hotelQuery.isLoading
          }
          label={
            createMutation.isPending || updateMutation.isPending
              ? 'Saving hotel...'
              : hotelId
                ? 'Save changes'
                : 'Create hotel'
          }
          onPress={saveHotel}
        />
      </ScrollView>
    </AdminScreenLayout>
  );
}
