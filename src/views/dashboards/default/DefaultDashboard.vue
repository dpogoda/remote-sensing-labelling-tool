<script setup lang="ts">
// imported components
</script>

<template>
  <v-container>
    <!-- FAQ Section -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Frequently Asked Questions</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>What is remote sensing data labeling?</v-list-item-title>
                  <v-list-item-subtitle>
                    Remote sensing data labeling involves annotating data collected from satellite or airborne sensors, which is used for training machine learning models.
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>How do I start labeling data?</v-list-item-title>
                  <v-list-item-subtitle>
                    To start labeling data, you need to access the labeling tool, upload your dataset, and follow the on-screen instructions to label the images according to the guidelines.
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>What formats of data are supported?</v-list-item-title>
                  <v-list-item-subtitle>
                    Our tool supports various formats including GeoTIFF, JPEG, and PNG for images and CSV for metadata.
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Can I label data collaboratively?</v-list-item-title>
                  <v-list-item-subtitle>
                    Yes, our tool supports collaborative labeling where multiple users can work on the same dataset simultaneously.
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>