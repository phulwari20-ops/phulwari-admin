/**
 * Print & Export Utilities for Student Data
 */

// ---------------------------------------------------------------------------
// Shared helpers for the printable Registration / Consent form.
// The single-student print and the bulk print used to carry two identical
// copies of the whole template. They now share buildRegistrationFormHtml so a
// fix (payment values, plan validity, customized schedule) lands in both.
// ---------------------------------------------------------------------------

const esc = (v: any) => (v === null || v === undefined ? '' : String(v))

// The parent passes an enriched student (see enrichStudentForPrint in
// app/page.tsx): payment_mode, amount_paid, plan dates, classes consumed and,
// for a customised batch, the resolved list of Day → Time → Class rows.
const isMode = (paymentMode: string, target: 'Cash' | 'UPI' | 'Bank') => {
  const m = (paymentMode || '').toLowerCase()
  if (target === 'Cash') return m.includes('cash')
  if (target === 'UPI') return m.includes('upi') || m.includes('online')
  return m.includes('bank') || m.includes('net') || m.includes('card')
}

const formatDateToDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
};

const buildRegistrationFormHtml = (st: any): string => {
  const paymentMode = esc(st.payment_mode)
  const amountPaid = st.amount_paid !== '' && st.amount_paid != null ? `₹ ${esc(st.amount_paid)}` : ''
  const printDate = esc(st.print_date)                    // DD/MM/YYYY registration date
  const planStart = esc(st.plan_start_date)
  const planEnd = esc(st.plan_end_date)
  const classesTotal = esc(st.classes_total)
  const classesConsumed = st.classes_consumed != null ? esc(st.classes_consumed) : '0'
  const consumedLine = classesTotal !== '' ? `${classesConsumed} / ${classesTotal} classes` : `${classesConsumed} classes`
  const paymentFor = esc(st.payment_for)
  const isPayFor = (label: string) => (paymentFor || '').toLowerCase().includes(label.toLowerCase())
  const remarks = esc(st.remarks)
  const inr = (v: any) => (Number(v) || 0).toLocaleString('en-IN')
  const feeTotal = inr(st.total_fee_display)
  const feeCollected = inr(st.fee_collected_display)
  const feeDue = inr(st.fee_due_display)
  const customList: any[] = Array.isArray(st.custom_schedules_list) ? st.custom_schedules_list : []
  const isCustomized = customList.length > 0

  // Split a printed date "DD/MM/YYYY" into its three boxes.
  const dateParts = printDate.split('/')
  const dd = dateParts[0] || ''
  const mm = dateParts[1] || ''
  const yyyy = dateParts[2] || ''
  const endParts = planEnd.split('/')
  const edd = endParts[0] || ''
  const emm = endParts[1] || ''
  const eyyy = endParts[2] || ''

  // When customised: show only the resolved schedule (Day → Time → Class) and
  // hide the generic "Program / Activity Interested In" checkboxes entirely.
  const programBlock = isCustomized
    ? `
            <div style="margin-bottom: 10px; font-size: 13px; font-weight: bold; color: #166534;">Customized Schedule (Day → Time → Class):</div>
            <div style="margin-bottom: 15px;">
              ${customList.map(row => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 4px 8px; margin-bottom: 4px; border: 1px solid #16653433; border-radius: 6px; background: #16653408;">
                  <span style="font-weight: bold; width: 90px;">📅 ${esc(row.day_of_week)}</span>
                  <span style="font-family: monospace; color: #1D4ED8;">${esc(row.start_time)} - ${esc(row.end_time)}</span>
                  <span style="font-weight: bold; color: #BE185D;">${esc(row.class_name)}</span>
                </div>
              `).join('')}
            </div>`
    : `
            <div style="margin-bottom: 10px; font-size: 13px;">Program / Activity Interested In:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 15px;">
              <div><input type="checkbox"> Playzone</div>
              <div><input type="checkbox"> Weekend Prog.</div>
              <div><input type="checkbox"> 3 Days Prog.</div>
              <div><input type="checkbox"> 5 Days Prog.</div>
              <div><input type="checkbox"> 6 Days Prog.</div>
              <div><input type="checkbox"> 7 Days Prog.</div>
              <div><input type="checkbox"> Mother Zumba</div>
              <div><input type="checkbox"> Other: <span style="border-bottom: 1px solid #000; display:inline-block; width:40px;"></span></div>
            </div>`

  return `
        <div style="box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0;">

          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="flex: 1.2;">
              <img src="/Logo-png.png" style="width: 140px; height: auto;" alt="Phulwari Logo" />
              <div style="color: #10B981; font-weight: bold; font-size: 10px; background: #064E3B; color: white; display: inline-block; padding: 2px 10px; border-radius: 12px; margin-top: 4px;">Where Growth Meets Wellness</div>
              <div style="font-size: 9px; line-height: 1.3; color: #444; margin-top: 6px;">
                📍 M/32, Road No. 25, Sri Krishna Nagar, Kidwaipuri, Patna - 800001<br/>
                📞 +91 6207368839 | ✉️ phulwari02@gmail.com
              </div>
            </div>

            <div style="flex: 1.8; text-align: center;">
              <h1 style="color: #1B1464; font-size: 36px; font-weight: 900; margin: 0; line-height: 1;">PARENT</h1>
              <h2 style="color: #E11D48; font-size: 24px; font-weight: 900; margin: 0; line-height: 1.2;">REGISTRATION FORM</h2>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
              ${st.photo_url ? `<img src="${esc(st.photo_url)}" style="width: 100px; height: 120px; object-fit: cover; border: 2px solid #E11D48; border-radius: 8px;" />` : `<div style="width: 100px; height: 120px; border: 2px dashed #E11D48; border-radius: 8px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10px; font-weight: bold; color: #E11D48; background: #FFF1F2; box-sizing: border-box; padding: 4px;">Affix Photo Here</div>`}
            </div>
          </div>

          <!-- Top Boxes -->
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; border: 2px solid #E11D48; border-radius: 8px; padding: 10px 15px; display: flex; align-items: center;">
              <strong style="color: #E11D48; font-size: 16px; margin-right: 10px;">Admission No.:</strong>
              <span style="border-bottom: 1px solid #000; flex: 1; font-weight: bold;">${esc(st.admission_id)}</span>
            </div>
            <div style="flex: 1; border: 2px solid #E11D48; border-radius: 8px; padding: 10px 15px; display: flex; align-items: center;">
              <strong style="color: #E11D48; font-size: 16px; margin-right: 10px;">Date:</strong>
              <div style="flex: 1; display: flex; justify-content: space-between; text-align: center;">
                <div style="border-bottom: 1px solid #000; width: 34px; font-weight:bold;">${dd}</div><span style="color: #666; font-size:10px;">DD</span>
                <span>/</span>
                <div style="border-bottom: 1px solid #000; width: 34px; font-weight:bold;">${mm}</div><span style="color: #666; font-size:10px;">MM</span>
                <span>/</span>
                <div style="border-bottom: 1px solid #000; width: 46px; font-weight:bold;">${yyyy}</div><span style="color: #666; font-size:10px;">YYYY</span>
              </div>
            </div>
          </div>

          <!-- 1. CHILD'S DETAILS -->
          <div style="border: 2px solid #E11D48; border-radius: 8px; position: relative; padding: 25px 15px 15px; margin-bottom: 20px;">
            <div style="position: absolute; top: -14px; left: -2px; background: #E11D48; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">1. CHILD'S DETAILS</div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Child's Full Name:</span>
              <span style="border-bottom: 1px solid #000; flex: 1; font-weight: bold;">${esc(st.full_name)}</span>
              <span style="white-space: nowrap;">Date of Birth:</span>
              <span style="border-bottom: 1px solid #000; width: 120px; text-align: center; font-weight: bold;">${formatDateToDisplay(esc(st.dob))}</span>
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 20px; align-items: flex-end;">
              <span style="white-space: nowrap;">Gender:</span>
              <span><input type="checkbox" ${st.gender === 'Boy' ? 'checked' : ''}> Male</span>
              <span><input type="checkbox" ${st.gender === 'Girl' ? 'checked' : ''}> Female</span>
              <span><input type="checkbox" ${st.gender !== 'Boy' && st.gender !== 'Girl' ? 'checked' : ''}> Other</span>
              <span style="margin-left: 30px; white-space: nowrap;">Blood Group:</span>
              <span style="border-bottom: 1px solid #000; width: 100px; text-align: center; font-weight: bold;">${esc(st.blood_group) || 'N/A'}</span>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px;">
              <span style="white-space: nowrap;">Address:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.address)}</span>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">City:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.city) || 'Patna'}</span>
              <span style="white-space: nowrap;">State:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.state) || 'Bihar'}</span>
              <span style="white-space: nowrap;">PIN Code:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.pin_code) || '800001'}</span>
            </div>
          </div>

          <!-- 2. PARENT / GUARDIAN DETAILS -->
          <div style="border: 2px solid #3B0764; border-radius: 8px; position: relative; padding: 25px 15px 15px; margin-bottom: 20px;">
            <div style="position: absolute; top: -14px; left: -2px; background: #3B0764; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">2. PARENT / GUARDIAN DETAILS</div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Parent / Guardian Full Name:</span>
              <span style="border-bottom: 1px solid #000; flex: 2; font-weight: bold;">${esc(st.parent_name)}</span>
              <span style="white-space: nowrap;">Relationship:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.parent_relationship)}</span>
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Email ID:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.parent_email)}</span>
              <span style="white-space: nowrap;">Occupation:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.parent_occupation)}</span>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Phone No.:</span>
              <span style="border-bottom: 1px solid #000; flex: 1; font-weight: bold;">${esc(st.parent_phone)}</span>
              <span style="white-space: nowrap;">Alternate Phone No.:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.parent_alt_phone)}</span>
            </div>
          </div>

          <!-- 3. EMERGENCY CONTACT DETAILS -->
          <div style="border: 2px solid #D97706; border-radius: 8px; position: relative; padding: 25px 15px 15px; margin-bottom: 20px;">
            <div style="position: absolute; top: -14px; left: -2px; background: #D97706; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">3. EMERGENCY CONTACT DETAILS</div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Emergency Contact Name:</span>
              <span style="border-bottom: 1px solid #000; flex: 2;">${esc(st.emergency_contact_name)}</span>
              <span style="white-space: nowrap;">Relationship:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.emergency_relationship)}</span>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Phone No.:</span>
              <span style="border-bottom: 1px solid #000; flex: 1; font-weight: bold;">${esc(st.emergency_phone)}</span>
              <span style="white-space: nowrap;">Alternate Phone No.:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.emergency_alt_phone)}</span>
            </div>
          </div>

          <!-- 4. MEDICAL DETAILS & SPECIAL INSTRUCTIONS -->
          <div style="border: 2px solid #0891B2; border-radius: 8px; position: relative; padding: 25px 15px 15px; margin-bottom: 20px;">
            <div style="position: absolute; top: -14px; left: -2px; background: #0891B2; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">4. MEDICAL DETAILS & SPECIAL INSTRUCTIONS</div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Has Medical Condition / Allergies?</span>
              <span style="margin-left: 10px;"><input type="checkbox" ${st.has_medical_condition ? 'checked' : ''}> Yes</span>
              <span><input type="checkbox" ${!st.has_medical_condition ? 'checked' : ''}> No</span>
              <span style="white-space: nowrap; margin-left: 20px;">Details (if yes):</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.medical_condition_details)}</span>
            </div>

            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Regular Medication:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.regular_medication)}</span>
              <span style="white-space: nowrap;">Preferred Hospital:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.hospital_preference)}</span>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Pediatrician/Doctor Name:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.doctor_name)}</span>
              <span style="white-space: nowrap;">Doctor Phone No.:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${esc(st.doctor_phone)}</span>
            </div>
          </div>

          <div style="display: flex; gap: 20px; margin-bottom: 20px; align-items: stretch;">
            <!-- 5. PROGRAM / BATCH DETAILS -->
            <div style="flex: 1; border: 2px solid #166534; border-radius: 8px; position: relative; padding: 25px 15px 15px;">
              <div style="position: absolute; top: -14px; left: -2px; background: #166534; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">5. PROGRAM / BATCH DETAILS</div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 12px; font-size: 13px;">
                <span style="white-space: nowrap;">Plan / Batch:</span>
                <span style="border-bottom: 1px solid #000; flex: 1; font-weight: bold;">${esc(st.batch_name)}</span>
              </div>

              ${programBlock}

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 12px; font-size: 13px;">
                <span style="white-space: nowrap;">No. of Classes Assigned:</span>
                <span style="border-bottom: 1px solid #000; flex: 1; text-align: center; font-weight: bold;">${classesTotal}</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 12px; font-size: 13px;">
                <span style="white-space: nowrap;">Already Consumed:</span>
                <span style="border-bottom: 1px solid #000; flex: 1; text-align: center; font-weight: bold; color: #B45309;">${consumedLine}</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 12px; font-size: 13px;">
                <span style="white-space: nowrap;">📅 Plan Validity:</span>
                <span style="border-bottom: 1px solid #000; flex: 1; text-align: center; font-weight: bold; color: #166534;">${formatDateToDisplay(planStart) || '—'} &nbsp;→&nbsp; ${formatDateToDisplay(planEnd) || '—'}</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; font-size: 13px;">
                <span style="white-space: nowrap;">📅 Validity Ending:</span>
                <div style="flex: 1; display: flex; justify-content: space-between; text-align: center; margin-left: 10px;">
                  <div style="border-bottom: 1px solid #000; width: 34px; font-weight:bold;">${edd}</div><span style="color: #666; font-size:10px;">DD</span>
                  <span>/</span>
                  <div style="border-bottom: 1px solid #000; width: 34px; font-weight:bold;">${emm}</div><span style="color: #666; font-size:10px;">MM</span>
                  <span>/</span>
                  <div style="border-bottom: 1px solid #000; width: 46px; font-weight:bold;">${eyyy}</div><span style="color: #666; font-size:10px;">YYYY</span>
                </div>
              </div>
            </div>

            <!-- 6. PAYMENT DETAILS -->
            <div style="flex: 1; border: 2px solid #1D4ED8; border-radius: 8px; position: relative; padding: 25px 15px 15px;">
              <div style="position: absolute; top: -14px; left: -2px; background: #1D4ED8; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">6. PAYMENT DETAILS</div>

              <div style="margin-bottom: 10px; font-size: 13px;">Mode of Payment:</div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px;">
                <div><input type="checkbox" ${isMode(paymentMode, 'Cash') ? 'checked' : ''}> Cash</div>
                <div><input type="checkbox" ${isMode(paymentMode, 'UPI') ? 'checked' : ''}> UPI</div>
                <div><input type="checkbox" ${isMode(paymentMode, 'Bank') ? 'checked' : ''}> Bank Transfer</div>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                <span style="white-space: nowrap;">Amount Paid:</span>
                <span style="border-bottom: 1px solid #000; flex: 1; font-weight: bold; color: #047857;">${amountPaid}</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                <span style="white-space: nowrap;">Payment Date:</span>
                <span style="border-bottom: 1px solid #000; flex: 1; font-weight: bold;">${formatDateToDisplay(printDate)}</span>
              </div>

              <!-- Fee breakdown: Total / Collected / Due -->
              <div style="display: flex; gap: 6px; margin-bottom: 15px; font-size: 12px;">
                <div style="flex:1; text-align:center; border:1px solid #1D4ED833; border-radius:6px; padding:4px;">
                  <div style="font-size:9px; color:#64748B; font-weight:bold;">TOTAL FEE</div>
                  <div style="font-weight:bold; color:#1D4ED8;">₹${feeTotal}</div>
                </div>
                <div style="flex:1; text-align:center; border:1px solid #04785733; border-radius:6px; padding:4px;">
                  <div style="font-size:9px; color:#64748B; font-weight:bold;">COLLECTED</div>
                  <div style="font-weight:bold; color:#047857;">₹${feeCollected}</div>
                </div>
                <div style="flex:1; text-align:center; border:1px solid #E11D4833; border-radius:6px; padding:4px;">
                  <div style="font-size:9px; color:#64748B; font-weight:bold;">DUE</div>
                  <div style="font-weight:bold; color:#E11D48;">₹${feeDue}</div>
                </div>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                <span style="white-space: nowrap;">Payment For:</span>
                <span><input type="checkbox" ${isPayFor('Monthly') ? 'checked' : ''}> Monthly Fee</span>
                <span><input type="checkbox" ${isPayFor('Registration') ? 'checked' : ''}> Registration Fee</span>
                <span><input type="checkbox" ${isPayFor('Other') ? 'checked' : ''}> Other</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; font-size: 13px;">
                <span style="white-space: nowrap;">Remarks (if any):</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${remarks}</span>
              </div>
            </div>
          </div>

          <!-- 7. TERMS & CONDITIONS -->
          <div style="border: 2px solid #F472B6; border-radius: 8px; position: relative; padding: 25px 15px 10px; page-break-inside: avoid;">
            <div style="position: absolute; top: -14px; left: -2px; background: #E11D48; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">7. TERMS & CONDITIONS</div>

            <ul style="font-size: 10px; line-height: 1.4; padding-left: 20px; margin: 0; color: #111;">
              <li>I confirm that all the information provided above is true and accurate to the best of my knowledge.</li>
              <li>I agree to pay the fees as per the program selected.</li>
              <li>Registration fee is non-refundable.</li>
              <li>Fees once paid are non-refundable and non-transferable.</li>
              <li>I understand that physical activities, play and learning sessions may involve movement and participation.</li>
              <li>I authorize Phulwari - Mother & Child Activity Centre to seek necessary medical treatment for my child in case of any injury or illness during the activities, and I will bear all related expenses.</li>
              <li>I give permission for Phulwari to use my child's photographs / videos taken during activities for training, documentation, promotional purposes (such as social media, website, brochures, etc.).</li>
              <li>I understand that the management reserves the right to make changes in schedules, timings, or activities when required.</li>
              <li>I agree to abide by all the rules, policies and guidelines of Phulwari - Mother & Child Activity Centre.</li>
              <li>I understand that in case of any damage caused by my child to centre property, I will be responsible for the same.</li>
            </ul>

            <!-- Signatures -->
            <div style="display: flex; justify-content: space-between; margin-top: 30px; padding: 0 20px 10px; align-items: flex-end;">
              <div style="display: flex; gap: 10px; align-items: flex-end; flex: 1;">
                <strong style="font-size: 14px;">Parent / Guardian Signature:</strong>
                <div style="border-bottom: 1px solid #000; flex: 1; margin-right: 40px;"></div>
              </div>
              <div style="display: flex; gap: 10px; align-items: flex-end;">
                <strong style="font-size: 14px;">Date:</strong>
                <div style="border-bottom: 1px solid #000; width: 120px; text-align: center; font-weight: bold;">${printDate}</div>
              </div>
            </div>

            <!-- Bottom Tagline -->
            <div style="text-align: center; color: #16A34A; font-weight: bold; font-size: 12px; margin-top: 10px;">
              🌸 Nurturing Bonds. Building Confidence. Creating Happy Childhoods. 🌸
            </div>
          </div>

        </div>`
}

export const handleExportStudentsCSV = (students: any[]) => {
  const headers = ['Admission ID', 'Student Name', 'DOB', 'Gender', 'Blood Group', 'Batch Name', 'Batch ID', 'Parent Name', 'Parent Phone', 'Parent Email', 'Address', 'Status']
  const rows = students.map(s => [
    s.admission_id,
    `"${s.full_name}"`,
    s.dob || '',
    s.gender || '',
    s.blood_group || '',
    `"${s.batch_name || 'Mother & Toddler Program'}"`,
    s.batch_id || '',
    `"${s.parent_name}"`,
    s.parent_phone,
    s.parent_email || '',
    `"${s.address}"`,
    s.status || 'active'
  ])
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Phulwari_Students_Directory_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const handleExportStudentsPDF = (students: any[]) => {
  const rowsHtml = students.map((s) => `
    <tr style="border-bottom: 1px solid #E2E8F0; font-size: 12px;">
      <td style="padding: 10px; font-weight: 700; font-family: monospace; color: #2563EB;">${s.admission_id}</td>
      <td style="padding: 10px; font-weight: 700; color: #0F172A;">${s.full_name}</td>
      <td style="padding: 10px; font-weight: 600; color: #475569;">${s.batch_name || 'Mother & Toddler'}</td>
      <td style="padding: 10px; color: #475569;">${s.parent_name}</td>
      <td style="padding: 10px; font-family: monospace; color: #64748B;">${s.parent_phone}</td>
      <td style="padding: 10px; color: #059669; font-weight: 700;">Active</td>
    </tr>
  `).join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Phulwari Enrolled Students Directory</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1E293B; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #FF4D8D; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #0F172A; }
          .subtitle { font-size: 12px; color: #64748B; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { background: #F8FAFC; padding: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #CBD5E1; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">🌸 Phulwari Mother & Child Activity Centre</div>
            <div class="subtitle">Official Student Master Directory — Generated ${new Date().toLocaleDateString()}</div>
          </div>
          <div style="text-align: right; font-size: 12px; font-weight: 700; color: #2563EB;">
            Total Students: ${students.length}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Admission ID</th>
              <th>Student Name</th>
              <th>Assigned Batch</th>
              <th>Parent Name</th>
              <th>Phone Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); };</script>
      </body>
    </html>
  `

  const printWin = window.open('', '_blank', 'width=800,height=900')
  if (printWin) {
    printWin.document.write(htmlContent)
    printWin.document.close()
  }
}

export const handleExportBulkRegistrationForms = (students: any[]) => {
  const printWin = window.open('', '_blank')
  if (!printWin) return

  let allFormsHtml = ''
  students.forEach((st, index) => {
    allFormsHtml += `
      <div style="page-break-after: ${index === students.length - 1 ? 'auto' : 'always'};">
        ${buildRegistrationFormHtml(st)}
      </div>
    `
  })

  const printHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bulk Student Registration Forms</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          @page { size: A4; margin: 10mm; }
        }
      </style>
    </head>
    <body>
      ${allFormsHtml}
      <script>
        setTimeout(() => { window.print(); }, 1000);
      </script>
    </body>
    </html>
  `
  printWin.document.write(printHtml)
  printWin.document.close()
}

export const handlePrintRegistrationForm = (st: any) => {
  const printWin = window.open('', '_blank')
  if (!printWin) return

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student Registration & Consent Form - ${st.full_name}</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        ${buildRegistrationFormHtml(st)}
        <script>
          window.onload = function() { window.print(); setTimeout(() => { window.close(); }, 2000); };
        </script>
      </body>
    </html>
  `
  printWin.document.write(printHtml)
  printWin.document.close()
}
