import React from 'react';

const ComponentsForms = () => (
              <section id="Components-Forms" className="section is-secondary">
                <div className="container">
                  <div className="sg_section-heading-wrapper">
                    <div className="sg_heading-row">
                      <h2>Forms</h2>
                      <a href="https://developers.webflow.com/flowkit/components/forms" target="_blank" rel="noreferrer noopener" className="text-button w-inline-block">
                        <div>Read docs</div>
                        <div className="button_icon"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
                            <path d="M6 6v2h8.59L5 17.59L6.41 19L16 9.41V18h2V6z" fill="currentColor"></path>
                          </svg></div>
                      </a>
                    </div>
                  </div>
                  <div className="flex_horizontal flex_vertical gap-large">
                    <div className="grid_2-col mobile-l-1-col gap-medium">
                      <div className="sg_table-col">
                        <div className="sg_table-cell-title">On Primary Color</div>
                        <div className="sg_preview-bordered background_primary">
                          <div className="w-form">
                            <form id="wf-form-Test-Form" name="wf-form-Test-Form" data-name="Test Form" method="get" data-wf-page-id="68dbb5369c5fc9bb055fd1d7" data-wf-element-id="6401b070-0ac8-bcf0-2647-73725f5e5fa9">
                              <div className="input"><label htmlFor="name-4" className="input_label">Name</label><input className="input_field w-input" maxLength="256" name="name-3" data-name="Name 3" placeholder="Name" type="text" id="name-3" /></div>
                              <div className="input"><label htmlFor="field-5" className="input_label">Select</label><select id="field-4" name="field-4" data-name="Field 4" className="input_field is-select w-select">
                                  <option value="">Select one...</option>
                                  <option value="First">First choice</option>
                                  <option value="Second">Second choice</option>
                                  <option value="Third">Third choice</option>
                                </select></div>
                              <div className="input"><label htmlFor="textarea-3" className="input_label">Message</label><textarea id="textarea" name="field-3" maxLength="5000" data-name="field" placeholder="Example Text" className="input_field is-text-area w-input"></textarea></div><label className="w-checkbox checkbox">
                                <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox_toggle"></div><input type="checkbox" name="checkbox-3" id="checkbox-3" data-name="Checkbox 3" style={{opacity: 0, position: "absolute", zIndex: -1}} /><span className="checkbox_label w-form-label" htmlFor="checkbox-3">Short sentence</span>
                              </label><label className="radio w-radio">
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio_toggle w-radio-input"></div><input type="radio" name="Radio-Group" id="Radio -4" data-name="Radio Group" style={{opacity: 0, position: "absolute", zIndex: -1}} value="Radio 2" /><span htmlFor="Radio -4" className="radio_label w-form-label">Radio 2</span>
                              </label>
                              <div className="button-group"><input type="submit" data-wait="Please wait..." className="button w-button" value="Submit" /></div>
                            </form>
                            <div className="form_success-message w-form-done">
                              <div>Thank you! Your submission has been received!</div>
                            </div>
                            <div className="form_error-message w-form-fail">
                              <div>Oops! Something went wrong while submitting the form.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="sg_table-col">
                        <div className="sg_table-cell-title">On Inverse Color</div>
                        <div className="section is-inverse sg_preview-bordered">
                          <div className="w-form">
                            <form id="wf-form-Test-Form" name="wf-form-Test-Form" data-name="Test Form" method="get" data-wf-page-id="68dbb5369c5fc9bb055fd1d7" data-wf-element-id="6401b070-0ac8-bcf0-2647-73725f5e5fcb">
                              <div className="input"><label htmlFor="name-4" className="input_label">Name</label><input className="input_field on-inverse w-input" maxLength="256" name="name-2" data-name="Name 2" placeholder="Name" type="text" id="name-2" /></div>
                              <div className="input"><label htmlFor="Select-Country-4" className="input_label">Country</label><select id="field-4" name="field-4" data-name="Field 4" className="input_field is-select on-inverse w-select">
                                  <option value="">Select one...</option>
                                  <option value="First">First choice</option>
                                  <option value="Second">Second choice</option>
                                  <option value="Third">Third choice</option>
                                </select></div>
                              <div className="input"><label htmlFor="textarea-3" className="input_label">Message</label><textarea id="textarea-2" name="field-3" maxLength="5000" data-name="field" placeholder="Example Text" className="input_field is-inverse w-input"></textarea></div><label className="w-checkbox checkbox">
                                <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox_toggle on-inverse"></div><input type="checkbox" name="checkbox-2" id="checkbox-2" data-name="Checkbox 2" style={{opacity: 0, position: "absolute", zIndex: -1}} /><span className="checkbox_label w-form-label" htmlFor="checkbox-2">Short sentence</span>
                              </label><label className="radio w-radio">
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio_toggle on-inverse w-radio-input"></div><input type="radio" name="Radio-Group-Dark" id="Radio-1" data-name="Radio Group Dark" style={{opacity: 0, position: "absolute", zIndex: -1}} value="Radio 1" /><span htmlFor="Radio-1" className="radio_label w-form-label">Radio 1</span>
                              </label>
                              <div className="button-group"><input type="submit" data-wait="Please wait..." className="button is-inverse w-button" value="Submit" /></div>
                            </form>
                            <div className="form_success-message w-form-done">
                              <div>Thank you! Your submission has been received!</div>
                            </div>
                            <div className="form_error-message w-form-fail">
                              <div>Oops! Something went wrong while submitting the form.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex_horizontal gap-medium tablet-vertical">
                      <div className="sg_table-col">
                        <div className="sg_table-cell-title">On accent</div>
                        <div className="section is-accent-primary sg_preview-bordered">
                          <div className="w-form">
                            <form id="wf-form-Test-Form" name="wf-form-Test-Form" data-name="Test Form" method="get" data-wf-page-id="68dbb5369c5fc9bb055fd1d7" data-wf-element-id="6401b070-0ac8-bcf0-2647-73725f5e5fee">
                              <div className="input"><label htmlFor="name-4" className="input_label">Name</label><input className="input_field on-accent-primary w-input" maxLength="256" name="name-2" data-name="Name 2" placeholder="Name" type="text" id="name-2" /></div>
                              <div className="input"><label htmlFor="Select-Country-4" className="input_label">Country</label><select id="field-4" name="field-4" data-name="Field 4" className="input_field is-select on-accent-primary w-select">
                                  <option value="">Select one...</option>
                                  <option value="First">First choice</option>
                                  <option value="Second">Second choice</option>
                                  <option value="Third">Third choice</option>
                                </select></div>
                              <div className="input"><label htmlFor="textarea-3" className="input_label">Message</label><textarea id="textarea-2" name="field-3" maxLength="5000" data-name="field" placeholder="Example Text" className="input_field is-text-area on-accent-primary w-input"></textarea></div><label className="w-checkbox checkbox">
                                <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox_toggle on-primary-accent"></div><input type="checkbox" name="checkbox-2" id="checkbox-2" data-name="Checkbox 2" style={{opacity: 0, position: "absolute", zIndex: -1}} /><span className="checkbox_label w-form-label" htmlFor="checkbox-2">Short sentence</span>
                              </label><label className="radio w-radio">
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio_toggle on-accent-primary w-radio-input"></div><input type="radio" name="Radio-Group-Dark" id="Radio-1" data-name="Radio Group Dark" style={{opacity: 0, position: "absolute", zIndex: -1}} value="Radio 1" /><span htmlFor="Radio-1" className="radio_label w-form-label">Radio 1</span>
                              </label>
                              <div className="button-group"><input type="submit" data-wait="Please wait..." className="button on-accent-primary w-button" value="Submit" /></div>
                            </form>
                            <div className="form_success-message w-form-done">
                              <div>Thank you! Your submission has been received!</div>
                            </div>
                            <div className="form_error-message w-form-fail">
                              <div>Oops! Something went wrong while submitting the form.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="sg_table-col sg_accent-secondary-visibility">
                        <div className="sg_table-cell-title">On accent secondary</div>
                        <div className="section is-accent-secondary sg_preview-bordered">
                          <div className="w-form">
                            <form id="wf-form-Test-Form" name="wf-form-Test-Form" data-name="Test Form" method="get" data-wf-page-id="68dbb5369c5fc9bb055fd1d7" data-wf-element-id="6401b070-0ac8-bcf0-2647-73725f5e6010">
                              <div className="input"><label htmlFor="name-4" className="input_label">Name</label><input className="input_field on-accent-secondary w-input" maxLength="256" name="name-2" data-name="Name 2" placeholder="Name" type="text" id="name-2" /></div>
                              <div className="input"><label htmlFor="Select-Country-4" className="input_label">Country</label><select id="field-4" name="field-4" data-name="Field 4" className="input_field is-select on-accent-secondary w-select">
                                  <option value="">Select one...</option>
                                  <option value="First">First choice</option>
                                  <option value="Second">Second choice</option>
                                  <option value="Third">Third choice</option>
                                </select></div>
                              <div className="input"><label htmlFor="textarea-3" className="input_label">Message</label><textarea id="textarea-2" name="field-3" maxLength="5000" data-name="field" placeholder="Example Text" className="input_field is-text-area on-accent-secondary w-input"></textarea></div><label className="w-checkbox checkbox">
                                <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox_toggle on-accent-secondary"></div><input type="checkbox" name="checkbox-2" id="checkbox-2" data-name="Checkbox 2" style={{opacity: 0, position: "absolute", zIndex: -1}} /><span className="checkbox_label w-form-label" htmlFor="checkbox-2">Short sentence</span>
                              </label><label className="radio w-radio">
                                <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio_toggle on-accent-secondary w-radio-input"></div><input type="radio" name="Radio-Group-Dark" id="Radio-1" data-name="Radio Group Dark" style={{opacity: 0, position: "absolute", zIndex: -1}} value="Radio 1" /><span htmlFor="Radio-1" className="radio_label w-form-label">Radio 1</span>
                              </label>
                              <div className="button-group"><input type="submit" data-wait="Please wait..." className="button on-accent-secondary w-button" value="Submit" /></div>
                            </form>
                            <div className="form_success-message w-form-done">
                              <div>Thank you! Your submission has been received!</div>
                            </div>
                            <div className="form_error-message w-form-fail">
                              <div>Oops! Something went wrong while submitting the form.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="sg_table-col sg_accent-tertiary-visibility">
                        <div className="sg_table-cell-title">On accent tertiary</div>
                        <div className="section is-accent-tertiary sg_preview-bordered">
                          <div className="w-form">
                            <form id="wf-form-Test-Form" name="wf-form-Test-Form" data-name="Test Form" method="get" data-wf-page-id="68dbb5369c5fc9bb055fd1d7" data-wf-element-id="6401b070-0ac8-bcf0-2647-73725f5e6032">
                              <div>
                                <div className="input"><label htmlFor="name-4" className="input_label">Name</label><input className="input_field on-accent-tertiary w-input" maxLength="256" name="name-2" data-name="Name 2" placeholder="Name" type="text" id="name-2" /></div>
                                <div className="input"><label htmlFor="Select-Country-4" className="input_label">Country</label><select id="field-4" name="field-4" data-name="Field 4" className="input_field is-select on-accent-tertiary w-select">
                                    <option value="">Select one...</option>
                                    <option value="First">First choice</option>
                                    <option value="Second">Second choice</option>
                                    <option value="Third">Third choice</option>
                                  </select></div>
                                <div className="input"><label htmlFor="textarea-3" className="input_label">Message</label><textarea id="textarea-2" name="field-3" maxLength="5000" data-name="field" placeholder="Example Text" className="input_field is-text-area on-accent-tertiary w-input"></textarea></div><label className="w-checkbox checkbox">
                                  <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox_toggle on-accent-tertiary"></div><input type="checkbox" name="checkbox-2" id="checkbox-2" data-name="Checkbox 2" style={{opacity: 0, position: "absolute", zIndex: -1}} /><span className="checkbox_label w-form-label" htmlFor="checkbox-2">Short sentence</span>
                                </label><label className="radio w-radio">
                                  <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio_toggle on-accent-tertiary w-radio-input"></div><input type="radio" name="Radio-Group-Dark" id="Radio-1" data-name="Radio Group Dark" style={{opacity: 0, position: "absolute", zIndex: -1}} value="Radio 1" /><span htmlFor="Radio-1" className="radio_label w-form-label">Radio 1</span>
                                </label>
                              </div>
                              <div className="button-group"><input type="submit" data-wait="Please wait..." className="button on-accent-tertiary w-button" value="Submit" /></div>
                            </form>
                            <div className="form_success-message w-form-done">
                              <div>Thank you! Your submission has been received!</div>
                            </div>
                            <div className="form_error-message w-form-fail">
                              <div>Oops! Something went wrong while submitting the form.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
);

export default ComponentsForms;
