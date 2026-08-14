import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update Gallery sorting
content = content.replace(
    "const res = await fetch(`${supabaseUrl}/rest/v1/gallery?select=*`, {",
    "const res = await fetch(`${supabaseUrl}/rest/v1/gallery?select=*&order=created_at.desc`, {"
)

# 2. HTML Templates
html_template = """    let allFormsHtml = ''
    filteredStudents.forEach((st, index) => {
      allFormsHtml += `
        <div style="page-break-after: ${index === filteredStudents.length - 1 ? 'auto' : 'always'}; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0;">
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div style="flex: 1;">
              <img src="https://phulwari.co.in/Logo-png.png" style="width: 150px; height: auto;" alt="Phulwari Logo" />
              <div style="color: #10B981; font-weight: bold; font-size: 14px; background: #064E3B; color: white; display: inline-block; padding: 4px 16px; border-radius: 20px; margin-top: 10px;">Where Growth Meets Wellness</div>
            </div>
            
            <div style="flex: 2; text-align: center;">
              <h1 style="color: #1B1464; font-size: 42px; font-weight: 900; margin: 0; line-height: 1;">PARENT</h1>
              <h2 style="color: #E11D48; font-size: 28px; font-weight: 900; margin: 0; line-height: 1.2;">REGISTRATION FORM</h2>
            </div>
            
            <div style="flex: 1; text-align: right; font-size: 11px; line-height: 1.5; color: #333;">
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                <span>📍 M/32, Road No. 25,<br/>Sri Krishna Nagar,<br/>Kidwaipuri, Patna - 800001</span>
              </div>
              <div style="margin-top: 4px;">📞 +91 6207368839</div>
              <div>✉️ phulwari02@gmail.com</div>
              <div>🌐 www.phulwari.co.in</div>
              <div>📸 @phulwari.activitycentre</div>
            </div>
          </div>

          <!-- Top Boxes -->
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; border: 2px solid #E11D48; border-radius: 8px; padding: 10px 15px; display: flex; align-items: center;">
              <strong style="color: #E11D48; font-size: 16px; margin-right: 10px;">Admission No.:</strong>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.admission_id}</span>
            </div>
            <div style="flex: 1; border: 2px solid #E11D48; border-radius: 8px; padding: 10px 15px; display: flex; align-items: center;">
              <strong style="color: #E11D48; font-size: 16px; margin-right: 10px;">Date:</strong>
              <div style="flex: 1; display: flex; justify-content: space-between; text-align: center;">
                <div style="border-bottom: 1px solid #000; width: 30px;"></div><span style="color: #666; font-size:10px;">DD</span>
                <span>/</span>
                <div style="border-bottom: 1px solid #000; width: 30px;"></div><span style="color: #666; font-size:10px;">MM</span>
                <span>/</span>
                <div style="border-bottom: 1px solid #000; width: 40px;"></div><span style="color: #666; font-size:10px;">YYYY</span>
              </div>
            </div>
          </div>

          <!-- 1. CHILD'S DETAILS -->
          <div style="border: 2px solid #E11D48; border-radius: 8px; position: relative; padding: 25px 15px 15px; margin-bottom: 20px;">
            <div style="position: absolute; top: -14px; left: -2px; background: #E11D48; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">1. CHILD'S DETAILS</div>
            
            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Child's Full Name:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.full_name}</span>
              <span style="white-space: nowrap;">Date of Birth:</span>
              <span style="border-bottom: 1px solid #000; width: 120px; text-align: center;">${st.dob || ''}</span>
            </div>
            
            <div style="display: flex; margin-bottom: 15px; gap: 20px; align-items: flex-end;">
              <span style="white-space: nowrap;">Gender:</span>
              <span><input type="checkbox" ${st.gender === 'Boy' ? 'checked' : ''}> Male</span>
              <span><input type="checkbox" ${st.gender === 'Girl' ? 'checked' : ''}> Female</span>
              <span><input type="checkbox" ${st.gender !== 'Boy' && st.gender !== 'Girl' ? 'checked' : ''}> Other</span>
              <span style="margin-left: 30px; white-space: nowrap;">Age (as on today):</span>
              <span style="border-bottom: 1px solid #000; flex: 1;"></span>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">City:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.city || 'Patna'}</span>
              <span style="white-space: nowrap;">State:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.state || 'Bihar'}</span>
              <span style="white-space: nowrap;">PIN Code:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.pin_code || '800001'}</span>
            </div>
          </div>

          <!-- 2. PARENT / GUARDIAN DETAILS -->
          <div style="border: 2px solid #3B0764; border-radius: 8px; position: relative; padding: 25px 15px 15px; margin-bottom: 20px;">
            <div style="position: absolute; top: -14px; left: -2px; background: #3B0764; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">2. PARENT / GUARDIAN DETAILS</div>
            
            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Parent / Guardian Full Name:</span>
              <span style="border-bottom: 1px solid #000; flex: 2;">${st.parent_name}</span>
              <span style="white-space: nowrap;">Relationship:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_relationship || ''}</span>
            </div>
            
            <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Email ID:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_email || ''}</span>
              <span style="white-space: nowrap;">Occupation:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_occupation || ''}</span>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-end;">
              <span style="white-space: nowrap;">Phone No.:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_phone}</span>
              <span style="white-space: nowrap;">Alternate Phone No.:</span>
              <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_alt_phone || ''}</span>
            </div>
          </div>

          <div style="display: flex; gap: 20px; margin-bottom: 20px; align-items: stretch;">
            <!-- 3. PROGRAM / BATCH DETAILS -->
            <div style="flex: 1; border: 2px solid #166534; border-radius: 8px; position: relative; padding: 25px 15px 15px;">
              <div style="position: absolute; top: -14px; left: -2px; background: #166534; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">3. PROGRAM / BATCH DETAILS</div>
              
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
              </div>

              <div style="margin-bottom: 10px; font-size: 13px;">Preferred Time Slot:</div>
              <div style="display: flex; gap: 20px; font-size: 13px; margin-bottom: 15px;">
                <div style="flex: 1;"><input type="checkbox" ${st.preferred_time_slot === 'Morning' ? 'checked' : ''}> Morning <span style="border-bottom: 1px solid #000; display:inline-block; width:60%;"></span></div>
                <div style="flex: 1;"><input type="checkbox" ${st.preferred_time_slot === 'Evening' ? 'checked' : ''}> Evening <span style="border-bottom: 1px solid #000; display:inline-block; width:60%;"></span></div>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                <span style="white-space: nowrap;">No. of Classes Assigned:</span>
                <span style="border-bottom: 1px solid #000; flex: 1; text-align: center;">${st.classes_total || ''}</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; font-size: 13px;">
                <span style="white-space: nowrap;">📅 Plan Validity Ending Date:</span>
                <div style="flex: 1; display: flex; justify-content: space-between; text-align: center; margin-left: 10px;">
                  <div style="border-bottom: 1px solid #000; width: 30px;"></div><span style="color: #666; font-size:10px;">DD</span>
                  <span>/</span>
                  <div style="border-bottom: 1px solid #000; width: 30px;"></div><span style="color: #666; font-size:10px;">MM</span>
                  <span>/</span>
                  <div style="border-bottom: 1px solid #000; width: 40px;"></div><span style="color: #666; font-size:10px;">YYYY</span>
                </div>
              </div>
            </div>

            <!-- 4. PAYMENT DETAILS -->
            <div style="flex: 1; border: 2px solid #1D4ED8; border-radius: 8px; position: relative; padding: 25px 15px 15px;">
              <div style="position: absolute; top: -14px; left: -2px; background: #1D4ED8; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">4. PAYMENT DETAILS</div>
              
              <div style="margin-bottom: 10px; font-size: 13px;">Mode of Payment:</div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px;">
                <div><input type="checkbox"> Cash</div>
                <div><input type="checkbox"> UPI</div>
                <div><input type="checkbox"> Bank Transfer</div>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                <span style="white-space: nowrap;">Amount Paid (₹):</span>
                <span style="border-bottom: 1px solid #000; flex: 1;"></span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                <span style="white-space: nowrap;">Plan / Program:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.batch_name || ''}</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                <span style="white-space: nowrap;">Payment For:</span>
                <span><input type="checkbox"> Monthly Fee</span>
                <span><input type="checkbox"> Registration Fee</span>
                <span><input type="checkbox"> Other</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end; font-size: 13px;">
                <span style="white-space: nowrap;">Remarks (if any):</span>
                <span style="border-bottom: 1px solid #000; flex: 1;"></span>
              </div>
            </div>
          </div>

          <!-- 5. TERMS & CONDITIONS -->
          <div style="border: 2px solid #F472B6; border-radius: 8px; position: relative; padding: 25px 15px 10px;">
            <div style="position: absolute; top: -14px; left: -2px; background: #E11D48; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">5. TERMS & CONDITIONS</div>
            
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
                <div style="display: flex; justify-content: space-between; text-align: center; width: 120px;">
                  <div style="border-bottom: 1px solid #000; width: 30px;"></div>
                  <span>/</span>
                  <div style="border-bottom: 1px solid #000; width: 30px;"></div>
                  <span>/</span>
                  <div style="border-bottom: 1px solid #000; width: 40px;"></div>
                </div>
              </div>
            </div>
            
            <!-- Bottom Tagline -->
            <div style="text-align: center; color: #16A34A; font-weight: bold; font-size: 12px; margin-top: 10px;">
              🌸 Nurturing Bonds. Building Confidence. Creating Happy Childhoods. 🌸
            </div>
          </div>

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
  }"""

single_template = """  const handlePrintRegistrationForm = (st: any) => {
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
          <div style="box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0;">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div style="flex: 1;">
                <img src="https://phulwari.co.in/Logo-png.png" style="width: 150px; height: auto;" alt="Phulwari Logo" />
                <div style="color: #10B981; font-weight: bold; font-size: 14px; background: #064E3B; color: white; display: inline-block; padding: 4px 16px; border-radius: 20px; margin-top: 10px;">Where Growth Meets Wellness</div>
              </div>
              
              <div style="flex: 2; text-align: center;">
                <h1 style="color: #1B1464; font-size: 42px; font-weight: 900; margin: 0; line-height: 1;">PARENT</h1>
                <h2 style="color: #E11D48; font-size: 28px; font-weight: 900; margin: 0; line-height: 1.2;">REGISTRATION FORM</h2>
              </div>
              
              <div style="flex: 1; text-align: right; font-size: 11px; line-height: 1.5; color: #333;">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                  <span>📍 M/32, Road No. 25,<br/>Sri Krishna Nagar,<br/>Kidwaipuri, Patna - 800001</span>
                </div>
                <div style="margin-top: 4px;">📞 +91 6207368839</div>
                <div>✉️ phulwari02@gmail.com</div>
                <div>🌐 www.phulwari.co.in</div>
                <div>📸 @phulwari.activitycentre</div>
              </div>
            </div>

            <!-- Top Boxes -->
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
              <div style="flex: 1; border: 2px solid #E11D48; border-radius: 8px; padding: 10px 15px; display: flex; align-items: center;">
                <strong style="color: #E11D48; font-size: 16px; margin-right: 10px;">Admission No.:</strong>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.admission_id}</span>
              </div>
              <div style="flex: 1; border: 2px solid #E11D48; border-radius: 8px; padding: 10px 15px; display: flex; align-items: center;">
                <strong style="color: #E11D48; font-size: 16px; margin-right: 10px;">Date:</strong>
                <div style="flex: 1; display: flex; justify-content: space-between; text-align: center;">
                  <div style="border-bottom: 1px solid #000; width: 30px;"></div><span style="color: #666; font-size:10px;">DD</span>
                  <span>/</span>
                  <div style="border-bottom: 1px solid #000; width: 30px;"></div><span style="color: #666; font-size:10px;">MM</span>
                  <span>/</span>
                  <div style="border-bottom: 1px solid #000; width: 40px;"></div><span style="color: #666; font-size:10px;">YYYY</span>
                </div>
              </div>
            </div>

            <!-- 1. CHILD'S DETAILS -->
            <div style="border: 2px solid #E11D48; border-radius: 8px; position: relative; padding: 25px 15px 15px; margin-bottom: 20px;">
              <div style="position: absolute; top: -14px; left: -2px; background: #E11D48; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">1. CHILD'S DETAILS</div>
              
              <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
                <span style="white-space: nowrap;">Child's Full Name:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.full_name}</span>
                <span style="white-space: nowrap;">Date of Birth:</span>
                <span style="border-bottom: 1px solid #000; width: 120px; text-align: center;">${st.dob || ''}</span>
              </div>
              
              <div style="display: flex; margin-bottom: 15px; gap: 20px; align-items: flex-end;">
                <span style="white-space: nowrap;">Gender:</span>
                <span><input type="checkbox" ${st.gender === 'Boy' ? 'checked' : ''}> Male</span>
                <span><input type="checkbox" ${st.gender === 'Girl' ? 'checked' : ''}> Female</span>
                <span><input type="checkbox" ${st.gender !== 'Boy' && st.gender !== 'Girl' ? 'checked' : ''}> Other</span>
                <span style="margin-left: 30px; white-space: nowrap;">Age (as on today):</span>
                <span style="border-bottom: 1px solid #000; flex: 1;"></span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end;">
                <span style="white-space: nowrap;">City:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.city || 'Patna'}</span>
                <span style="white-space: nowrap;">State:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.state || 'Bihar'}</span>
                <span style="white-space: nowrap;">PIN Code:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.pin_code || '800001'}</span>
              </div>
            </div>

            <!-- 2. PARENT / GUARDIAN DETAILS -->
            <div style="border: 2px solid #3B0764; border-radius: 8px; position: relative; padding: 25px 15px 15px; margin-bottom: 20px;">
              <div style="position: absolute; top: -14px; left: -2px; background: #3B0764; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">2. PARENT / GUARDIAN DETAILS</div>
              
              <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
                <span style="white-space: nowrap;">Parent / Guardian Full Name:</span>
                <span style="border-bottom: 1px solid #000; flex: 2;">${st.parent_name}</span>
                <span style="white-space: nowrap;">Relationship:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_relationship || ''}</span>
              </div>
              
              <div style="display: flex; margin-bottom: 15px; gap: 10px; align-items: flex-end;">
                <span style="white-space: nowrap;">Email ID:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_email || ''}</span>
                <span style="white-space: nowrap;">Occupation:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_occupation || ''}</span>
              </div>

              <div style="display: flex; gap: 10px; align-items: flex-end;">
                <span style="white-space: nowrap;">Phone No.:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_phone}</span>
                <span style="white-space: nowrap;">Alternate Phone No.:</span>
                <span style="border-bottom: 1px solid #000; flex: 1;">${st.parent_alt_phone || ''}</span>
              </div>
            </div>

            <div style="display: flex; gap: 20px; margin-bottom: 20px; align-items: stretch;">
              <!-- 3. PROGRAM / BATCH DETAILS -->
              <div style="flex: 1; border: 2px solid #166534; border-radius: 8px; position: relative; padding: 25px 15px 15px;">
                <div style="position: absolute; top: -14px; left: -2px; background: #166534; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">3. PROGRAM / BATCH DETAILS</div>
                
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
                </div>

                <div style="margin-bottom: 10px; font-size: 13px;">Preferred Time Slot:</div>
                <div style="display: flex; gap: 20px; font-size: 13px; margin-bottom: 15px;">
                  <div style="flex: 1;"><input type="checkbox" ${st.preferred_time_slot === 'Morning' ? 'checked' : ''}> Morning <span style="border-bottom: 1px solid #000; display:inline-block; width:60%;"></span></div>
                  <div style="flex: 1;"><input type="checkbox" ${st.preferred_time_slot === 'Evening' ? 'checked' : ''}> Evening <span style="border-bottom: 1px solid #000; display:inline-block; width:60%;"></span></div>
                </div>

                <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                  <span style="white-space: nowrap;">No. of Classes Assigned:</span>
                  <span style="border-bottom: 1px solid #000; flex: 1; text-align: center;">${st.classes_total || ''}</span>
                </div>

                <div style="display: flex; gap: 10px; align-items: flex-end; font-size: 13px;">
                  <span style="white-space: nowrap;">📅 Plan Validity Ending Date:</span>
                  <div style="flex: 1; display: flex; justify-content: space-between; text-align: center; margin-left: 10px;">
                    <div style="border-bottom: 1px solid #000; width: 30px;"></div><span style="color: #666; font-size:10px;">DD</span>
                    <span>/</span>
                    <div style="border-bottom: 1px solid #000; width: 30px;"></div><span style="color: #666; font-size:10px;">MM</span>
                    <span>/</span>
                    <div style="border-bottom: 1px solid #000; width: 40px;"></div><span style="color: #666; font-size:10px;">YYYY</span>
                  </div>
                </div>
              </div>

              <!-- 4. PAYMENT DETAILS -->
              <div style="flex: 1; border: 2px solid #1D4ED8; border-radius: 8px; position: relative; padding: 25px 15px 15px;">
                <div style="position: absolute; top: -14px; left: -2px; background: #1D4ED8; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">4. PAYMENT DETAILS</div>
                
                <div style="margin-bottom: 10px; font-size: 13px;">Mode of Payment:</div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 15px;">
                  <div><input type="checkbox"> Cash</div>
                  <div><input type="checkbox"> UPI</div>
                  <div><input type="checkbox"> Bank Transfer</div>
                </div>

                <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                  <span style="white-space: nowrap;">Amount Paid (₹):</span>
                  <span style="border-bottom: 1px solid #000; flex: 1;"></span>
                </div>

                <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                  <span style="white-space: nowrap;">Plan / Program:</span>
                  <span style="border-bottom: 1px solid #000; flex: 1;">${st.batch_name || ''}</span>
                </div>

                <div style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 15px; font-size: 13px;">
                  <span style="white-space: nowrap;">Payment For:</span>
                  <span><input type="checkbox"> Monthly Fee</span>
                  <span><input type="checkbox"> Registration Fee</span>
                  <span><input type="checkbox"> Other</span>
                </div>

                <div style="display: flex; gap: 10px; align-items: flex-end; font-size: 13px;">
                  <span style="white-space: nowrap;">Remarks (if any):</span>
                  <span style="border-bottom: 1px solid #000; flex: 1;"></span>
                </div>
              </div>
            </div>

            <!-- 5. TERMS & CONDITIONS -->
            <div style="border: 2px solid #F472B6; border-radius: 8px; position: relative; padding: 25px 15px 10px;">
              <div style="position: absolute; top: -14px; left: -2px; background: #E11D48; color: white; padding: 4px 15px; font-weight: bold; border-top-left-radius: 6px; border-bottom-right-radius: 6px; font-size: 14px;">5. TERMS & CONDITIONS</div>
              
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
                  <div style="display: flex; justify-content: space-between; text-align: center; width: 120px;">
                    <div style="border-bottom: 1px solid #000; width: 30px;"></div>
                    <span>/</span>
                    <div style="border-bottom: 1px solid #000; width: 30px;"></div>
                    <span>/</span>
                    <div style="border-bottom: 1px solid #000; width: 40px;"></div>
                  </div>
                </div>
              </div>
              
              <!-- Bottom Tagline -->
              <div style="text-align: center; color: #16A34A; font-weight: bold; font-size: 12px; margin-top: 10px;">
                🌸 Nurturing Bonds. Building Confidence. Creating Happy Childhoods. 🌸
              </div>
            </div>

          </div>
          <script>
            setTimeout(() => { window.print(); }, 1000);
          </script>
        </body>
      </html>
    `
    printWin.document.write(printHtml)
    printWin.document.close()
  }"""

bulk_start = content.find("    let allFormsHtml = ''")
bulk_end = content.find("  // Print Registration PDF Form", bulk_start)
content = content[:bulk_start] + html_template + "\n" + content[bulk_end:]

single_start = content.find("  // Print Registration PDF Form")
single_start = content.find("  const handlePrintRegistrationForm = (st: any) => {", single_start)
single_end = content.find("  // Send Prerequisite WhatsApp Fee Due Reminder", single_start)
content = content[:single_start] + single_template + "\n" + content[single_end:]


with open('app/page.tsx', 'w') as f:
    f.write(content)

