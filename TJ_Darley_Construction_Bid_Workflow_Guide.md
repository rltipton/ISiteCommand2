# TJ DARLEY CONSTRUCTION, LLC
## Standard Operating Procedure (SOP): Bid Generation Pipeline
**Version:** 2.4  
**Classification:** Operational Excellence Training Guide  
**Purpose:** Step-by-Step Training Guide to Synchronizing Data from the Ballpark Estimator to the Pre-Bid Field Intake Survey, to the Multi-Phase Bids, and Generating Final Client-facing Proposals.

---

### Introduction & High-Level System Concept
At TJ Darley Construction, LLC, we pride ourselves on precision grading and efficient bid turnarounds. To eliminate mathematical errors and minimize client revision times, we have engineered an integrated digital pipeline that ties early-stage estimators to actual client accounts. 

The pipeline consists of **three core pillars**:
1. **The Ballpark Estimator**: Fast, high-level feasibility testing for pond and civil geometries.
2. **The Pre-Bid Field Intake Survey**: Real-world demographic profiling, GPS pinpoint logs, and soil/access verification.
3. **The Multi-Phase Bid Compiler**: Automated, heavy-machine-backed subsurface calculations that produce itemized materials, operator/labor logs, subcontractor profiles, and professional printable client proposals.

---

### SECTION 1: Standardizing Geometries in the Ballpark Estimator
The pipeline begins on site or at the drafting table with initial prospective dimensions.

1. **Navigate to the Ballpark Estimator component** on your application home board.
2. **Input Dimensions**: Input the following prospective values based on the initial phone consultation or geographic survey markers:
   * **Length of Excavation (Feet)**: The length of the planned dam or pond layout.
   * **Top Width of Excavation / Pool (Feet)**: The wide edge of the excavation.
   * **Bottom Width of Excavation (Feet)**: The bottom flat base of the pond/pool.
   * **Average Target Depth (Feet)**: Scaled based on typical Georgian aquatic depth guidelines.
3. **Adjust Physical Constants**:
   * **Soil Profile**: Select **Clay** (standard compacted weight), **Rocky** (granite excavating stress), or **Sand** (easy cycling).
   * **Site Access Quality**: Choose **Easy** (flat, paved frontage), **Moderate** (dirt road), or **Difficult** (heavy slope, steep access).
4. **Inspect Automated Calculations**:
   * Review the **Cubic Yards (CY) Cut/Fill excavation volumes** and the **Net Development Area (Square Feet / Acres)**.
   * Click **"Copy Excel/Sheets Row"** or **"Copy Material Metrics"** if you need a quick raw spreadsheet clipboard log to copy-paste directly into your billing sheet records.

---

### SECTION 2: Logging the Client Pre-Bid Field Intake Survey
Once the client demonstrates strong intent and we move to the formal pre-bid stage, you must log a formal intake profile. This secures the data in the local database history.

1. Click **"📋 Client Pre-Bid Intake"** or **"📋 Pre-Bid Intake"** in your application navigation header.
2. **Fill out Client Profile Information**:
   * **Client Name**: Full name or corporate property management details (e.g., *John Smith*).
   * **Job Name**: A clear name (e.g., *Lake Oconee Private Pond & House Pad*).
   * **Site Address / Location**: Standard postal lines or decimal coordinates.
   * **Assigned Foreman**: Select the managing supervisor on site.
3. **Log Physical Geometry Specifications**:
   * Populate the **Exact Dimensions** (Length, Top Width, Bottom Width, Depth) exactly corresponding to your verified calculations in the Ballpark Estimator.
   * Select the **Soil Profile** and **Access Road Type** to match your field-verified conditions.
4. **Submit Details**:
   * Click **"Submit Client Intake Report"**. 
   * This action generates a secure, unique **Field Intake ID (FI_ID)** (e.g., *FI-78A3*), files it in our database pipeline, and saves the complete dataset under `tjd_client_intakes` in the browser memory for instant retrieval in future phases.

---

### SECTION 3: The Multi-Phase Bid Compiler & Automation Mapping
This is where the automation takes place. The Multi-Phase Bid Compiler links directly to your saved intakes to automatically write 6 distinct construction phases.

1. Navigate to the **Multi-Phase Bids** tab or estimator workspace.
2. **Activate the Intake Preloader**:
   * Locate the dropdown selector marked **"Preload From Previous Pre-Bid Intake History"** in the active workspace.
   * Select your recently submitted client job from the history dropdown.
3. **Acknowledge the Intelli-Pond Auto-Population**:
   * Once selected, the system triggers the **Intelli-Pond Subsurface Mapping Engine**.
   * It maps your physical dimensions, area square feet, and excavation cut volumes to generate **6 standard construction phases and subphases**, creating a complete project bid blueprint:
     * **Phase 1: Preliminary Site Prep** -> *Forestry Mulching & Land Clearing*
     * **Phase 1: Preliminary Site Prep** -> *Perimeter Silt Fence Erosion Controls*
     * **Phase 1: Preliminary Site Prep** -> *Organic Topsoil Stripping & Stockpiling*
     * **Phase 2: Mass Grading & Excavating** -> *Deep Clay Core Keyway Fishing Pond Digging*
     * **Phase 3: Pond & Clay Pad Base** -> *Silt Retaining Basin Spillway Rocks Rip-Rap*
     * **Phase 5: Permanent Stabilization** -> *Topsoil Dressing & Seeding Stabilization*
4. **Review Automated Line Items**:
   * Scroll down to see full lists of **Georgia Granite Stone Tons**, **Heavy Machinery Dozer/Excavator Hours**, **Compaction Equipment Passes**, **Silt Fence material rolls**, and **Seed Blanket quantities**—all calculated automatically from your dimensions.

---

### SECTION 4: Modifying & Tweaking the Compiled Estimates
No two physical jobsites are identical; you can easily load and edit any automated phase.

1. **Locate the Project Compile Total Sheet** on the compiled summary grid.
2. **Click the "Edit" Button** (colored in amber with an editor icon) on the specific subphase you need to update.
   * This action shifts the workspace into **Subphase Active Edit Mode**.
   * It loads the exact dimension variables, material equations, and markup margins of that specific subphase back into your active workspace.
3. **Apply Custom Tweaks**:
   * Adjust the specific hourly rates or material price per ton.
   * Switch a subphase to a **Subcontracted Phase** (specify Subcontractor Cost and your custom markup percentage).
4. **Save Subphase Changes**:
   * Under the active items list, click the amber button: **"💾 Save Edited Sub-Phase Changes"**.
   * This saves the updated pricing and itemization directly back into the Project Totals compiled summary.

---

### SECTION 5: Generating and Printing the Final Client-Facing Proposal
The final step is converting your multi-phase compilation into a structured commercial agreement ready to present to your client.

1. Ensure all your calculated construction subphases have been compiled on the project sheets.
2. Fill out any additional field demographics:
   * **Project Job Number**: (e.g., *JOB-TJD-4902*)
   * **Client Name**, **Job Title**, and **Physical Address** for header inclusion.
3. **Add Contractual Notes**:
   * Scroll down to the **Notes / Disclaimers** input window.
   * Add any site-specific terms (e.g., *"Granite ledge blasting is excluded and billed at Cost + 15% should massive subsoil shelf rock be encountered during mass excavation."*).
4. **Review Proposal Rollups**:
   * Verify the final cumulative bids: **Total Subsurface Operating Cost**, **Assigned Markups/Profits**, and the final all-inclusive **TJ Darley Contract Fee**.
5. **Print and Export to PDF**:
   * Click **"Print Proposal"** at the foot of the compiler.
   * This leverages browser printer services (or allows you to save directly as a **PDF**) to render a highly stylized, high-contrast, professional TJ Darley Construction, LLC bid invoice—complete with formal field log stamps, corporate address banners, cost breakdowns, and formal client sign-off authorization sections.

---

### SECTION 6: Tutorial Example — Estimating a 3.5-Acre Pond & Embankment Dam

Use this step-by-step structural example to construct a bulletproof, highly professional bid for a **3.5-acre pond with a heavy earthen embankment dam** (150 feet long, 25 feet high, 16 feet wide at the top, and 116 feet wide at the bottom).

#### Mathematical Foundation & Site Geometry
Before entering variables, understand the math that drives the material costs, equipment hours, and profit calculations:
* **Pond Surface Area**: 3.5 Acres = **152,460 square feet** (3.5 * 43,560 sq ft/acre).
* **Dam Length**: **150 feet**.
* **Dam Height**: **25 feet**.
* **Dam Top Width**: **16 feet** (minimum width for heavy equipment transit).
* **Dam Bottom (Base) Width**: **116 feet** (supports safe stable side-slope ratios).
* **Dam Cross-Section Area**: Using the trapezoidal formula:  
  `Area = ((Top Width + Bottom Width) / 2) * Height`  
  `Area = ((16 + 116) / 2) * 25 = (132 / 2) * 25 = 66 * 25 = 1,650 square feet`
* **Required Dam Fill Volume**:  
  `Volume = Cross-Section Area * Dam Length`  
  `Volume = 1,650 sq ft * 150 ft = 247,500 cubic feet`  
  Convert to Cubic Yards (divide by 27):  
  `247,500 / 27 = 9,166.67 Cubic Yards (CY)` of engineered structural fill clay.

---

#### Step-by-Step System Execution

##### Step 1: Open the In-House Estimator & Configure Rates
* Navigate to the **"In-House Estimator"** tab in the Office Hub (Automation Hub) navigation menu.
* **Important Note**: The In-House Estimator is designed as a fully self-contained manual calculator for immediate, bulletproof pricing. It does *not* auto-populate or load from previous client intake logs, meaning you will fill out the estimate form directly.
* In the top-right corner of the estimator header, click **"Residential Rates"** to select customized residential land, acreage, and farm pond digs.

##### Step 2: Select Earthwork Scope & Dam Add-On
* From the **"Target Earthwork Scope"** dropdown, select **"Acreage Excavation & Retention Ponds"**.
* A specialized option will appear underneath. Check the box labeled **"Include Structural Dam Embedment"**. This incorporates keyway core trenching, compaction, and clay core structural safety multipliers.

##### Step 3: Configure Project Dimensions & Soil Modifiers
* Set the **"Scope Volume Size"** to **3.5**.
* Ensure the Unit Type toggle is set to **"Acres"**.
* Under **"Georgia Native Sub-soil Mud"**, select **"GA Red Clay"** (this automatically scales work hours and compaction coefficients by **1.30x**).
* Under **"Access Difficulty"**, select **"Minor Slopes"** (Moderate Access).

##### Step 4: Configure the Profit Protector Markup
* Click the **"App Customizer"** tab in the Office Hub navigation menu.
* Scroll down to the **"In-House Rate Margin Markup (Profit Protector)"** slider and adjust it to **20%** to safeguard against fuel surges or equipment haulage fees.
* Click **"Save & Apply Rebranding"** to commit the settings.

##### Step 5: Review the Automated Bid & Margin Report
* Return to the **"In-House Estimator"** tab.
* Scroll down to see the live calculated estimate sheet, which details:
  * **Raw Operating Earthmoving Subtotal**: Labor, diesel, and track wear.
  * **Custom profit markups**: Your applied **+20%** Profit Protector margin.
  * **Final Client Contract Fee**: Highly competitive, error-free bid value.
  * **Net profit yield and estimated completion timeline** (in weeks).

##### Step 6: Export and Print Branded PDF Proposal
* Click **"Print & Export PDF"** at the bottom of the estimate sheet.
* Save the file as a PDF using your browser print service, or print a copy to present to the client for immediate sign-off.
* Congratulations! You have prepared a professional, risk-mitigated, mathematically verified heavy excavation proposal! <div id="completed-example-watermark"></div>
